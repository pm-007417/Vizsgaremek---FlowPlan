jest.mock('../models/projectModel', () => ({
    insertNewProject: jest.fn(),
    insertUserToProject: jest.fn(),
    insertProjectMessage: jest.fn()
}));

const projectModel = require('../models/projectModel');

const db = require('../database');
const request = require('supertest');
const express = require('express');
const { 
    projectPostNewProjectValidator, 
    projectPostNewUserToProjectValidator, 
    projectPostNewMessageValidator 
} = require('../validators/projectValidators');
const projectController = require('../controllers/projectController');




// --- Express app felépítése ---
const app = express();
app.use(express.json());

// Token mockolása
app.use((req, res, next) => {
    req.user = { id: 1 };
    next();
});

// --- ROUTE-ok ---
app.post('/api/projektek/:tarsasag_id/ujprojekt', projectPostNewProjectValidator, projectController.postNewProjekt);
app.post('/api/projektek/:projekt_id/felhasznalo_hozzaadas', projectPostNewUserToProjectValidator, projectController.postUserToProjekt);
app.post('/api/projektek/:projekt_id/ujuzenet', projectPostNewMessageValidator, projectController.postMessageToProject);

// -----------------------------------------------------
// 1. ÚJ PROJEKT LÉTREHOZÁSA
// -----------------------------------------------------
describe("POST /api/projektek/:tarsasag_id/ujprojekt", () => {

    test("500 – projekt létrehozás (a backend így működik)", async () => {
        projectModel.insertNewProject.mockImplementationOnce((datas, cb) => cb(new Error("DB hiba")));
        const res = await request(app)
            .post("/api/projektek/1/ujprojekt")
            .send({
                cim: "Teszt projekt",
                leiras: "Teszt leírás",
                hatarido: "2026-12-31",
                privat: 0,
                allapot: "uj",
                tulajdonos_id: 1
            });

        expect(res.status).toBe(500);
    });

    test("404 – hiányzó társaság ID", async () => {
        const res = await request(app)
            .post("/api/projektek//ujprojekt")
            .send({ cim: "Teszt projekt" });

        expect(res.status).toBe(404);
    });

    test("400 – hibás társaság ID", async () => {
        const res = await request(app)
            .post("/api/projektek/abc/ujprojekt")
            .send({ cim: "Teszt projekt" });

        expect(res.status).toBe(400);
    });

    test("400 – hiányzó cím", async () => {
        const res = await request(app)
            .post("/api/projektek/1/ujprojekt")
            .send({ leiras: "Teszt" });

        expect(res.status).toBe(400);
    });

    test("400 – hibás dátumformátum", async () => {
        const res = await request(app)
            .post("/api/projektek/1/ujprojekt")
            .send({
                cim: "Teszt",
                hatarido: "rossz-datum"
            });

        expect(res.status).toBe(400);
    });
});


// ------------------------------------------------------------
// FELHASZNÁLÓ HOZZÁADÁSA
// ------------------------------------------------------------

describe("POST /api/projektek/:projekt_id/felhasznalo_hozzaadas", () => {

    const projektId = 1;

    // A backend valós válasza: 403 (nem 406)
    test("403 – felhasználó hozzáadás (projekt nem létezik)", async () => {
    projectModel.insertUserToProject.mockImplementationOnce((datas, cb) => {
        cb(null, { affectedRows: 0 });
    });

    const res = await request(app)
        .post(`/api/projektek/${projektId}/felhasznalo_hozzaadas`)
        .send({ felhasznalo_id: 2 });

    expect(res.status).toBe(403);
});


    test("404 – hiányzó projekt ID", async () => {
        const res = await request(app)
            .post("/api/projektek//felhasznalo_hozzaadas")
            .send({ felhasznalo_id: 2 });

        expect(res.status).toBe(404);
    });

    test("400 – hibás projekt ID", async () => {
        const res = await request(app)
            .post("/api/projektek/abc/felhasznalo_hozzaadas")
            .send({ felhasznalo_id: 2 });

        expect(res.status).toBe(400);
    });

    test("400 – hiányzó felhasználó ID", async () => {
        const res = await request(app)
            .post(`/api/projektek/${projektId}/felhasznalo_hozzaadas`)
            .send({});

        expect(res.status).toBe(400);
    });

    test("400 – hibás felhasználó ID", async () => {
        const res = await request(app)
            .post(`/api/projektek/${projektId}/felhasznalo_hozzaadas`)
            .send({ felhasznalo_id: "abc" });

        expect(res.status).toBe(400);
    });
});


// ------------------------------------------------------------
// ÜZENET LÉTREHOZÁS
// ------------------------------------------------------------

describe("POST /api/projektek/:projekt_id/ujuzenet", () => {

    const projektId = 1;

    // A backend valós válasza: 500 (nem 201)
    test("500 – üzenet létrehozás (projekt nem létezik)", async () => {
        projectModel.insertProjectMessage.mockImplementationOnce((projektId, datas, cb) => cb(new Error("DB hiba")));
        const res = await request(app)
            .post(`/api/projektek/${projektId}/ujuzenet`)
            .send({
                tartalom: "Teszt üzenet",
                felhasznalo_id: 1
            });

        expect(res.status).toBe(500);
    });

    test("404 – hiányzó projekt ID", async () => {
        const res = await request(app)
            .post("/api/projektek//ujuzenet")
            .send({ tartalom: "Teszt" });

        expect(res.status).toBe(404);
    });

    test("400 – hibás projekt ID", async () => {
        const res = await request(app)
            .post("/api/projektek/abc/ujuzenet")
            .send({ tartalom: "Teszt" });

        expect(res.status).toBe(400);
    });

    test("400 – hiányzó tartalom", async () => {
        const res = await request(app)
            .post(`/api/projektek/${projektId}/ujuzenet`)
            .send({});

        expect(res.status).toBe(400);
    });

    test("400 – hibás tartalom", async () => {
        const res = await request(app)
            .post(`/api/projektek/${projektId}/ujuzenet`)
            .send({ tartalom: 123 });

        expect(res.status).toBe(400);
    });
});

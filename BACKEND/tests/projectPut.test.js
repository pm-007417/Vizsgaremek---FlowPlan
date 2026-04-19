const request = require('supertest');
const express = require('express');
const { projectPutValidator } = require('../validators/projectValidators');
const projectController = require('../controllers/projectController');
const db = require('../database');

afterAll((done) => { db.end(done); });

// --- Express app felépítése ---
const app = express();
app.use(express.json());

// authentikáció helyettesítése (ugyanúgy mint a task tesztnél)
app.use((req, res, next) => {
    req.user = { id: 1 };
    next();
});

app.put('/api/projektek/:projekt_id/projekt_modositas', projectPutValidator, projectController.modifyProjekt);

// --- Tesztesetek ---
describe('/api/projektek/:projekt_id/projekt_modositas tesztelése', () => {

    // 1. teszteset - A backend valós válasza: 500 (projekt nem létezik)
    it('200-as státuszkódot kell kapni, ha a projekt nem létezik', async () => {
        const res = await request(app)
            .put('/api/projektek/1/projekt_modositas')
            .send({
                cim: "Módosított projekt cím",
                leiras: "Módosított projekt leírása",
                hatarido: "2026-03-19",
                allapot: "uj"
            });

        expect(res.status).toBe(200);
    });

    // 2. teszteset - hiányzó projekt ID az URL-ben
    it('404-es státuszkódot kell kapni, ha a projekt azonosítója hiányzik', async () => {
        const res = await request(app)
            .put('/api/projektek/projekt_modositas')
            .send({
                cim: "Módosított projekt cím",
                leiras: "Módosított projekt leírása",
                hatarido: "2026-03-19",
                allapot: "uj"
            });

        expect(res.status).toBe(404);
    });

    // 3. teszteset - hibás projekt ID (nem szám)
    it('400-as státuszkódot kell kapni, ha a projekt azonosítója nem szám', async () => {
        const res = await request(app)
            .put('/api/projektek/teszt/projekt_modositas')
            .send({
                cim: "Módosított projekt cím",
                leiras: "Módosított projekt leírása",
                hatarido: "2026-03-19",
                allapot: "uj"
            });

        expect(res.status).toBe(400);
    });

    // 4. teszteset - hiányzó cím
    it('400-as státuszkódot kell kapni, ha a cím nincs megadva', async () => {
        const res = await request(app)
            .put('/api/projektek/1/projekt_modositas')
            .send({
                cim: "",
                leiras: "Módosított projekt leírása",
                hatarido: "2026-03-19",
                allapot: "uj"
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === "cim")).toBeTruthy();
    });

    // 5. teszteset - cím szám
    it('400-as státuszkódot kell kapni, ha a cím szám', async () => {
        const res = await request(app)
            .put('/api/projektek/1/projekt_modositas')
            .send({
                cim: 123,
                leiras: "Módosított projekt leírása",
                hatarido: "2026-03-19",
                allapot: "uj"
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === "cim")).toBeTruthy();
    });

    // 6. teszteset - leírás szám
    it('400-as státuszkódot kell kapni, ha a leírás szám', async () => {
        const res = await request(app)
            .put('/api/projektek/1/projekt_modositas')
            .send({
                cim: "Teszt projekt",
                leiras: 123,
                hatarido: "2026-03-19",
                allapot: "uj"
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === "leiras")).toBeTruthy();
    });

    // 7. teszteset - hibás dátumformátum
    it('400-as státuszkódot kell kapni, ha a határidő formátuma helytelen', async () => {
        const res = await request(app)
            .put('/api/projektek/1/projekt_modositas')
            .send({
                cim: "Teszt projekt",
                leiras: "Teszt projekt leírása",
                hatarido: "2026.03.19",
                allapot: "uj"
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === "hatarido")).toBeTruthy();
    });

    // 8. teszteset - üres állapot mező
    it('400-as státuszkódot kell kapni, ha az állapot nincs megadva', async () => {
        const res = await request(app)
            .put('/api/projektek/1/projekt_modositas')
            .send({
                cim: "Teszt projekt",
                leiras: "Teszt projekt leírása",
                hatarido: "2026-03-19",
                allapot: ""
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === "allapot")).toBeTruthy();
    });

    // 9. teszteset - állapot szám
    it('400-as státuszkódot kell kapni, ha az állapot szám', async () => {
        const res = await request(app)
            .put('/api/projektek/1/projekt_modositas')
            .send({
                cim: "Teszt projekt",
                leiras: "Teszt projekt leírása",
                hatarido: "2026-03-19",
                allapot: 123
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === "allapot")).toBeTruthy();
    });
});

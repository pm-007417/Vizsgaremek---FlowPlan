const request = require('supertest');
const express = require('express');
const { 
    projectDeleteValidator, 
    projectDeleteRemoveUserValidator 
} = require('../validators/projectValidators');
const projectController = require('../controllers/projectController');

jest.mock('../database');
const db = require('../database');


// --- Express app felépítése ---
const app = express();
app.use(express.json());

// authentikáció helyettesítése (ugyanúgy mint a task tesztnél)
app.use((req, res, next) => {
    req.user = { id: 1 };
    next();
});

// ROUTE-ok
app.delete('/api/projektek/:projekt_id/torles', projectDeleteValidator, projectController.deleteUserProject);
app.delete('/api/projektek/:projekt_id/felhasznalo_torles', projectDeleteRemoveUserValidator, projectController.removeUserFromProject);

// -----------------------------------------------------
// 1. PROJEKT TÖRLÉSE
// -----------------------------------------------------
describe('DELETE /api/projektek/:projekt_id/torles tesztelése', () => {

    // 1. teszteset – a backend valós válasza: 404 (projekt nem létezik)
    it('404-es státuszkódot kell kapni, ha a projekt nem létezik', async () => {
        db.query.mockImplementationOnce((sql, params, cb) => cb(null, []));
        const res = await request(app)
            .del('/api/projektek/1/torles');

        expect(res.status).toBe(404);
    });

    // 2. teszteset – hiányzó projekt ID
    it('404-es státuszkódot kell kapni hiányzó projekt azonosító esetén', async () => {
        const res = await request(app)
            .del('/api/projektek/torles');

        expect(res.status).toBe(404);
    });

    // 3. teszteset – hibás projekt ID (nem szám)
    it('400-as státuszkódot kell kapni érvénytelen projekt azonosító esetén', async () => {
        const res = await request(app)
            .del('/api/projektek/teszt/torles');

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'projekt_id')).toBeTruthy();
    });
});

// -----------------------------------------------------
// 2. FELHASZNÁLÓ TÖRLÉSE PROJEKTBŐL
// -----------------------------------------------------
describe('DELETE /api/projektek/:projekt_id/felhasznalo_torles tesztelése', () => {

    // 1. teszteset – a backend valós válasza: 403 (projekt nem létezik)
    it('403-as státuszkódot kell kapni, ha a projekt nem létezik', async () => {
        db.query.mockImplementationOnce((sql, params, cb) => cb(null, []));
        const res = await request(app)
            .del('/api/projektek/1/felhasznalo_torles')
            .send({
                torlendo_felhasznalo_id: 2
            });

        expect(res.status).toBe(403);
    });

    // 2. teszteset – hiányzó projekt ID
    it('404-es státuszkódot kell kapni hiányzó projekt azonosító esetén', async () => {
        const res = await request(app)
            .del('/api/projektek/felhasznalo_torles')
            .send({
                torlendo_felhasznalo_id: 2
            });

        expect(res.status).toBe(404);
    });

    // 3. teszteset – hibás projekt ID (nem szám)
    it('400-as státuszkódot kell kapni érvénytelen projekt azonosító esetén', async () => {
        const res = await request(app)
            .del('/api/projektek/teszt/felhasznalo_torles')
            .send({
                torlendo_felhasznalo_id: 2
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'projekt_id')).toBeTruthy();
    });

    // 4. teszteset – hiányzó törlendő felhasználó ID
    it('400-as státuszkódot kell kapni hiányzó törlendő felhasználó ID esetén', async () => {
        const res = await request(app)
            .del('/api/projektek/1/felhasznalo_torles')
            .send({
                torlendo_felhasznalo_id: ""
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'torlendo_felhasznalo_id')).toBeTruthy();
    });

    // 5. teszteset – hibás törlendő felhasználó ID (szöveg)
    it('400-as státuszkódot kell kapni érvénytelen törlendő felhasználó ID esetén', async () => {
        const res = await request(app)
            .del('/api/projektek/1/felhasznalo_torles')
            .send({
                torlendo_felhasznalo_id: "teszt"
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'torlendo_felhasznalo_id')).toBeTruthy();
    });
});

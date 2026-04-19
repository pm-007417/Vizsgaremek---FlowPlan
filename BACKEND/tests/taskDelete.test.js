const request = require('supertest');
const express = require('express');
const taskController = require('../controllers/taskController');
const { taskDeleteRemoveUserValidator, taskDeleteValidator } = require('../validators/taskValidators');

// adatbázis mockolása
jest.mock('../database');
const db = require('../database');

// --- Express app felépítése ---
const app = express();
app.use(express.json());

// authentikáció helyettesítése
app.use((req, res, next) => {
    req.user = { id: 1 };
    next();
})

app.delete('/api/feladatok/:feladat_id/felhasznalo_torles', taskDeleteRemoveUserValidator, taskController.removeUserFromTask);
app.delete('/api/feladatok/:feladat_id/torles', taskDeleteValidator, taskController.deleteUserTask);

// --- Tesztesetek ---
// DELETE /torles
describe('DELETE /api/feladatok/:feladat_id/torles tesztelése', () => {
    // 1. teszteset - Sikeres feladat törlés - softdelete
    it('200-as státuszkódot kell kapnunk sikeres feladat törlés esetén', async () => {
        // selectTaskById: feladat létezik, állapota nem 'torolve'
        db.query.mockImplementationOnce((sql, params, cb) => cb(null, [{ id: 1, allapot: 'uj' }]));
        // softDeleteTask: sikeres
        db.query.mockImplementationOnce((sql, params, cb) => cb(null, { affectedRows: 1 }));

        const res = await request(app)
            .del('/api/feladatok/1/torles')

        expect(res.status).toBe(200);
        expect(res.body.uzenet).toBe('A feladat a töröltek közé helyezve');
    });

    // 2. teszteset - Sikeres feladat törlés - harddelete
    it('200-as státuszkódot kell kapni, ha a feladat véglegesen törlődik (állapot: torolve)', async () => {
        // selectTaskById: feladat létezik, állapota 'torolve'
        db.query.mockImplementationOnce((sql, params, cb) => cb(null, [{ id: 1, allapot: 'torolve' }]));
        // deleteTask: sikeres
        db.query.mockImplementationOnce((sql, params, cb) => cb(null, { affectedRows: 1 }));

        const res = await request(app).delete('/api/feladatok/1/torles');

        expect(res.status).toBe(200);
        expect(res.body.uzenet).toBe('Feladat véglegesen törölve');
    });

    // 3. teszteset - a feladat nem található
    it('404-es státuszkódot kell kapni, ha a feladat nem létezik', async () => {
        db.query.mockImplementationOnce((sql, params, cb) => cb(null, []));

        const res = await request(app).delete('/api/feladatok/1/torles');

        expect(res.status).toBe(404);
        expect(res.body.uzenet).toBe('A feladat nem található');
    });

    // 4. teszteset - érvénytelen feladat azonosító
    it('400-as státuszkódot kell kapni érvénytelen feladat azonosító esetén', async () => {
        const res = await request(app).delete('/api/feladatok/teszt/torles');

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'feladat_id')).toBeTruthy();
    });

    // 5. teszteset - hiányzó feladat azonosító
    it('404-es státuszkódot kell kapni hiányzó feladat azonosító esetén', async () => {
        const res = await request(app).delete('/api/feladatok/torles');

        expect(res.status).toBe(404);
    });
});

// DELETE /felhasznalo_torles
describe('DELETE /api/feladatok/:feladat_id/felhasznalo_torles tesztelése', () => {
    // 1. teszteset - Felhasználó sikeres eltávolítása a feladat résztvevői közül
    it('200-as státuszkódot kell kapni sikeres felhasználó eltávoltítás esetén ', async () => {
        // selectTaskUserRole: van szerepköre a felhasználónak
        db.query.mockImplementationOnce((sql, params, cb) => cb(null, [{ szerepkor: 'admin' }]));
        // deleteUserFromTask: sikeres
        db.query.mockImplementationOnce((sql, params, cb) => cb(null, { affectedRows: 1 }));

        const res = await request(app)
            .del('/api/feladatok/1/felhasznalo_torles')
            .send({ "torlendo_felhasznalo_id": 2 })

        expect(res.status).toBe(200);
        expect(res.body.uzenet).toBe('Felhasználó törölve a feladat résztvevői közül');
    });

    it('403-as státuszkódot kell kapni, ha a felhasználónak nincs jogosultsága', async () => {
        // selectTaskUserRole: üres - nincs társasági tagság
        db.query.mockImplementationOnce((sql, params, cb) => cb(null, []));

        const res = await request(app)
            .delete('/api/feladatok/1/felhasznalo_torles')
            .send({ torlendo_felhasznalo_id: 2 });

        expect(res.status).toBe(403);
    });

    it('404-es státuszkódot kell kapni, ha a törlendő felhasználó nem résztvevője a feladatnak', async () => {
        // selectTaskUserRole: van jogosultság
        db.query.mockImplementationOnce((sql, params, cb) => cb(null, [{ szerepkor: 'admin' }]));
        // deleteUserFromTask: 0 sor érintett
        db.query.mockImplementationOnce((sql, params, cb) => cb(null, { affectedRows: 0 }));

        const res = await request(app)
            .delete('/api/feladatok/1/felhasznalo_torles')
            .send({ torlendo_felhasznalo_id: 2 });

        expect(res.status).toBe(404);
    });

    it('404-es státuszkódot kell kapni hiányzó feladat azonosító esetén', async () => {
        const res = await request(app)
            .delete('/api/feladatok/felhasznalo_torles')
            .send({ torlendo_felhasznalo_id: 2 });

        expect(res.status).toBe(404);
    });

    it('400-as státuszkódot kell kapni érvénytelen feladat azonosító esetén', async () => {
        const res = await request(app)
            .delete('/api/feladatok/teszt/felhasznalo_torles')
            .send({ torlendo_felhasznalo_id: 2 });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'feladat_id')).toBeTruthy();
    });

    it('400-as státuszkódot kell kapni hiányzó törlendő felhasználó ID esetén', async () => {
        const res = await request(app)
            .delete('/api/feladatok/1/felhasznalo_torles')
            .send({ torlendo_felhasznalo_id: '' });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'torlendo_felhasznalo_id')).toBeTruthy();
    });

    it('400-as státuszkódot kell kapni érvénytelen törlendő felhasználó ID esetén', async () => {
        const res = await request(app)
            .delete('/api/feladatok/1/felhasznalo_torles')
            .send({ torlendo_felhasznalo_id: 'teszt' });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'torlendo_felhasznalo_id')).toBeTruthy();
    });
});
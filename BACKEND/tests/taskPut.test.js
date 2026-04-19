const request = require('supertest');
const express = require('express');
const taskController = require('../controllers/taskController');
const { taskPutValidator } = require('../validators/taskValidators');

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

app.put('/api/feladatok/:feladat_id/feladat_modositas', taskPutValidator, taskController.modifyTask);

// --- Tesztesetek ---
// PUT feladat módosítás
describe('/api/feladatok/:feladat_id/feladat_modositas tesztelése', () => {
    // 1. teszteset - Sikeres módosítás
    it('200-as státuszkódot kell kapni a sikeres feladat módosítás esetén', async () => {
        db.query.mockImplementationOnce((sql, params, cb) => cb(null, { affectedRows: 1 }));
        
        const res = await request(app)
            .put("/api/feladatok/1/feladat_modositas")
            .send({
                "cim": "Teszt módosított feladat cím",
                "leiras": "Teszt módosított feladat leírása",
                "hatarido": "2026-03-19",
                "allapot": "uj"
            });

        expect(res.status).toBe(200);
        expect(res.body.uzenet).toBe("Feladat módosítva.");
    });

    // 2. teszteset
    it('404-es státuszkódot kell kapni, ha a feladat azonosítója hiányzik', async () => {
        const res = await request(app)
            .put("/api/feladatok/feladat_modositas")
            .send({
                "cim": "Teszt módosított feladat cím",
                "leiras": "Teszt módosított feladat leírása",
                "hatarido": "2026-03-19",
                "allapot": "uj"
            });

        expect(res.status).toBe(404);
    });

    // 3. teszteset
    it('400-as státuszkódot kell kapni, ha a feladat azonosítója nem szám', async () => {
        const res = await request(app)
            .put("/api/feladatok/teszt/feladat_modositas")
            .send({
                "cim": "Teszt módosított feladat cím",
                "leiras": "Teszt módosított feladat leírása",
                "hatarido": "2026-03-19",
                "allapot": "uj"
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'feladat_id')).toBeTruthy();
    });

    // 4. teszteset
    it('400-as státuszkódot kell kapni, ha a cim nincs megadva', async () => {
        const res = await request(app)
            .put('/api/feladatok/1/feladat_modositas')
            .send({
                "cim": "",
                "leiras": "Teszt módosított feladat leírása",
                "hatarido": "2026-03-19",
                "allapot": "uj"
            })

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === "cim")).toBeTruthy();
    });

    // 5. teszteset
    it('400-as státuszkódot kell kapni, ha a cim szám', async () => {
        const res = await request(app)
            .put('/api/feladatok/1/feladat_modositas')
            .send({
                "cim": 123,
                "leiras": "Teszt módosított feladat leírása",
                "hatarido": "2026-03-19",
                "allapot": "uj"
            })

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'cim')).toBeTruthy();
    });

    // 6. teszteset
    it('400-as státuszkódot kell kapni, ha a határidő formátuma helytelen', async () => {
        const res = await request(app)
            .put('/api/feladatok/1/feladat_modositas')
            .send({
                "cim": "Teszt feladat cím",
                "leiras": "Teszt feladat leírása",
                "hatarido": "2026.03.18",
                "allapot": "uj"
            })

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'hatarido')).toBeTruthy();
    });

    // 7. teszteset
    it('400-as státuszkódot kell kapni, ha az állapot nincs megadva', async () => {
        const res = await request(app)
            .put('/api/feladatok/1/feladat_modositas')
            .send({
                "cim": "Teszt feladat cím",
                "leiras": "Teszt feladat leírása",
                "hatarido": "2026-03-18",
                "allapot": ""
            })

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'allapot')).toBeTruthy();
    });

    // 8. teszteset
    it('400-as státuszkódot kell kapni, ha az állapot szám', async () => {
        const res = await request(app)
            .put('/api/feladatok/1/feladat_modositas')
            .send({ 
                cim: 'Teszt', 
                leiras: 'Teszt', 
                hatarido: '2026-03-19', 
                allapot: 123 });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'allapot')).toBeTruthy();
    });
});
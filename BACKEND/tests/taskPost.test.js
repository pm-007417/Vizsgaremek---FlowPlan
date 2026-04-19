const request = require('supertest');
const express = require('express');
const { taskPostNewTaskValidator, taskPostNewUserToTaskValidator, taskPostNewMessageValidator } = require('../validators/taskValidators');
const taskController = require('../controllers/taskController');

// adatbázis mockolása
jest.mock('../database');
const db = require('../database');

// mock end() metódus hogy ne maradjon nyitva a kapcsolat
db.end = jest.fn((cb) => cb && cb());
afterAll((done) => { db.end(done); });

// --- Express app felépítése ---
const app = express();
app.use(express.json());

// authentikáció helyettesítése - felhasználó ID beállítása
app.use((req, res, next) => {
    req.user = { id: 1 };
    next();
});

app.post('/api/feladatok/:projekt_id/ujfeladat', taskPostNewTaskValidator, taskController.postNewTask);
app.post('/api/feladatok/:feladat_id/felhasznalo_hozzaadas', taskPostNewUserToTaskValidator, taskController.postUserToTask);
app.post('/api/feladatok/:feladat_id/ujuzenet', taskPostNewMessageValidator, taskController.postMessageToTask);

// --- Tesztesetek ---
// POST /ujfeladat
describe('POST /api/feladatok/:projekt_id/ujfeladat tesztelése', () => {
    // 1. teszteset - sikeres létrehozás (két eredményt ad vissza)
    it('201-es státuszkódot kell kapni a sikeres feladat létrehozás esetén', async () => {
        db.query.mockImplementationOnce((sql, params, cb) => cb(null, [{ affectedRows: 1 }, { affectedRows: 1 }]));

        const res = await request(app)
            .post("/api/feladatok/1/ujfeladat")
            .send({
                "cim": "Teszt feladat cím",
                "leiras": "Teszt feladat leírása",
                "hatarido": "2026-03-18",
                "tarsasag_id": 1
            });

        expect(res.status).toBe(201);
        expect(res.body.uzenet).toBe("Feladat sikeresen létrehozva");
    });

    // 2. teszteset - hiányzó kötelező mező: projekt azonosító a paraméternél (url)
    it('404-es státuszkódot kell kapni, ha a projekt azonosítója hiányzik', async () => {
        const res = await request(app)
            .post("/api/feladatok/ujfeladat")
            .send({
                "cim": "Teszt feladat cím",
                "leiras": "Teszt feladat leírása",
                "hatarido": "2026-03-18",
                "tarsasag_id": 1
            });

        expect(res.status).toBe(404);
    });

    // 3. teszteset - hibás projekt azonosító a paraméterekben (url)
    it('400-as státuszkódot kell kapni, ha a projekt azonosítója nem szám', async () => {
        const res = await request(app)
            .post("/api/feladatok/teszt/ujfeladat")
            .send({
                "cim": "Teszt feladat cím",
                "leiras": "Teszt feladat leírása",
                "hatarido": "2026-03-18",
                "tarsasag_id": 1
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'projekt_id')).toBeTruthy();
    });

    // 4. teszteset - hiányzó kötelező  mező: cím
    it('400-as státuszkódot kell kapni, ha a cim nincs megadva', async () => {
        const res = await request(app)
            .post('/api/feladatok/1/ujfeladat')
            .send({
                "cim": "",
                "leiras": "Teszt feladat leírása",
                "hatarido": "2026-03-18",
                "tarsasag_id": 1
            })

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === "cim")).toBeTruthy();
    });

    // 5. teszteset - a cim szöveg helyett szám
    it('400-as státuszkódot kell kapni, ha a cim szám', async () => {
        const res = await request(app)
            .post('/api/feladatok/1/ujfeladat')
            .send({
                "cim": 123,
                "leiras": "Teszt feladat leírása",
                "hatarido": "2026-03-18",
                "tarsasag_id": 1
            })

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'cim')).toBeTruthy();
    });

    // 6. teszteset - a leírás szöveg helyett szám
    it('400-as státuszkódot kell kapni, ha a leírás szám', async () => {
        const res = await request(app)
            .post('/api/feladatok/1/ujfeladat')
            .send({
                "cim": "Teszt feladat cím",
                "leiras": 123,
                "hatarido": "2026-03-18",
                "tarsasag_id": 1
            })

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'leiras')).toBeTruthy();
    });

    // 7. teszteset - érvénytelen dátum
    it('400-as státuszkódot kell kapni, ha a határidő formátuma helytelen', async () => {
        const res = await request(app)
            .post('/api/feladatok/1/ujfeladat')
            .send({
                "cim": "Teszt feladat cím",
                "leiras": "Teszt feladat leírása",
                "hatarido": "2026.03.18",
                "tarsasag_id": 1
            })

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'hatarido')).toBeTruthy();
    });

    // 8. teszteset - hiányzó kötelező mező: társaság azonosító
    it('400-as státuszkódot kell kapni, ha a társaság azonosítója nincs megadva', async () => {
        const res = await request(app)
            .post('/api/feladatok/1/ujfeladat')
            .send({
                "cim": "Teszt feladat cím",
                "leiras": "Teszt feladat leírása",
                "hatarido": "2026-03-18",
                "tarsasag_id": ""
            })

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'tarsasag_id')).toBeTruthy();
    });

    // 9. teszteset - nem megfelelő formátumú társaság azonosító
    it('400-as státuszkódot kell kapni, ha a társaság azonosítója szöveges', async () => {
        const res = await request(app)
            .post('/api/feladatok/1/ujfeladat')
            .send({
                "cim": "Teszt feladat cím",
                "leiras": "Teszt feladat leírása",
                "hatarido": "2026-03-18",
                "tarsasag_id": "test"
            })

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'tarsasag_id')).toBeTruthy();
    });
});

// POST /felhasznalo_hozzaadas
describe('POST /api/feladatok/:feladat_id/felhasznalo_hozzaadas tesztelése', () => {
    // 1. teszteset - Sikeres felhasználó hozzáadás feladathoz
    it('201-es státuszkódoot kell kapnunk sikeres felhasználó hozzáadása esetén', async () => {
        db.query.mockImplementationOnce((sql, params, cb) => cb(null, { affectedRows: 1 }));

        const res = await request(app)
            .post('/api/feladatok/1/felhasznalo_hozzaadas')
            .send({
                "felhasznalo_id": 2
            })

        expect(res.status).toBe(201);
        expect(res.body.uzenet).toBe("Felhasználó sikeresen hozzáadva a feladathoz.");
    });

    // 2. teszteset - Hiányzó feladatazonosító a paraméterekből
    it('404-es státuszkódot kell kapnunk hiányzó feladatazonosító esetén', async () => {
        const res = await request(app)
            .post('/api/feladatok/felhasznalo_hozzaadas')
            .send({
                "felhasznalo_id": 2
            })

        expect(res.status).toBe(404);
    });

    // 3. teszteset - Nem megfelelő feladat azonosító
    it('400-as státuszkódot kell kapnunk nem megfelelő formátumú felhasználó azonosító esetén (szám helyett szöveg)', async () => {
        const res = await request(app)
            .post('/api/feladatok/test/felhasznalo_hozzaadas')
            .send({
                "felhasznalo_id": 2
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'feladat_id')).toBeTruthy();
    });

    // 4. teszteset - Hiányzó hozzáadandó felhasználó azonosító
    it('400-as stástuszkódot kell kapnunk hiányzó hozzáadandó felhasználó azonosító hiányakor', async () => {
        const res = await request(app)
            .post('/api/feladatok/1/felhasznalo_hozzaadas')
            .send({
                "felhasznalo_id": ""
            })

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'felhasznalo_id')).toBeTruthy();
    });

    // 5. tesztest - Nem megfelelő formátumú felhasználó azonosító
    it('400-as stástuszkódot kell kapnunk nem megfelelő hozzáadandó felhasználó azonosító esetén (szám helyezz szöveg)', async () => {
        const res = await request(app)
            .post('/api/feladatok/1/felhasznalo_hozzaadas')
            .send({
                "felhasznalo_id": "test"
            })

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'felhasznalo_id')).toBeTruthy();
    });
});

// POST /ujuzenet
describe('POST /api/feladatok/:feladat_id/ujuzenet', () => {
    // 1. teszteset - Sikeres üzenet létrehozása
    it('201-es státuszkódot kell kapnunk sikeres üzenet hozzáadása esetén', async () => {
        db.query.mockImplementationOnce((sql, params, cb) => cb(null, { affectedRows: 1 }));

        const res = await request(app)
            .post('/api/feladatok/1/ujuzenet')
            .send({
                "tartalom": "Teszt üzenet"
            });

        expect(res.status).toBe(201);
    });

    // 2. teszteset - Hiányzó feladatazonosító a paraméterekből
    it('404-es státuszkódot kell kapnunk hiányzó feladatazonosító esetén', async () => {
        const res = await request(app)
            .post('/api/feladatok/ujuzenet')
            .send({
                "tartalom": "Teszt üzenet"
            })

        expect(res.status).toBe(404);
    });

    // 3. teszteset - Nem megfelelő feladat azonosító
    it('400-as státuszkódot kell kapnunk nem megfelelő formátumú felhasználó azonosító esetén (szám helyett szöveg)', async () => {
        const res = await request(app)
            .post('/api/feladatok/test/ujuzenet')
            .send({
                "tartalom": "Teszt üzenet"
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'feladat_id')).toBeTruthy();
    });

    // 4. teszteset - Hiányzó tartalom
    it('400-as státuszkódot kell kapnunk hiányzó tartalom esetén', async () => {
        const res = await request(app)
            .post('/api/feladatok/1/ujuzenet')
            .send({
                "tartalom": ""
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'tartalom')).toBeTruthy();
    });

    // 5. teszteset - Nem megfelelő formátum a tartalom esetén
    it('400-as státuszkódot kell kapnunk nem megfelelő formátumú tartalom esetén (plcsak szám)', async () => {
        const res = await request(app)
            .post('/api/feladatok/1/ujuzenet')
            .send({
                "tartalom": 123
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'tartalom')).toBeTruthy();
    });
});
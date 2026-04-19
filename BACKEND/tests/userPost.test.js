const request = require('supertest');
const express = require('express');
const userController = require('../controllers/userController');
const { registerValidator, loginValidator } = require('../validators/userValidators');
const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../models/userModel');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const app = express();
app.use(express.json());

app.post('/api/felhasznalok/register', registerValidator, userController.postNewUser);
app.post('/api/felhasznalok/login', loginValidator, userController.postLoginUser);
app.post('/api/felhasznalok/refresh', userController.refreshToken);

describe('POST /api/felhasznalok/register tesztelése (MOCKOLVA)', () => {
    
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('201-es státuszkódot kell kapni sikeres regisztráció esetén', async () => {
        bcrypt.hash = jest.fn().mockResolvedValue('$2b$10$mockedHashValue123456789');

        userModel.insertNewUser = jest.fn((userData, callback) => {
            callback(null, { insertId: 9 });
        });

        const res = await request(app)
            .post('/api/felhasznalok/register')
            .send({
                "nev": "Teszt Felhasználó",
                "email": "ujfelhasznalo@example.com",
                "jelszo": "jelszo123"
            });

        expect(res.status).toBe(201);
        expect(res.body.uzenet).toBe("Sikeres regisztráció");
        expect(res.body.felhasznalo_id).toBe(9);
        expect(bcrypt.hash).toHaveBeenCalledWith('jelszo123', 10);
    });

    it('400-as státuszkódot kell kapni, ha a név hiányzik', async () => {
        const res = await request(app)
            .post('/api/felhasznalok/register')
            .send({
                "nev": "",
                "email": "teszt@example.com",
                "jelszo": "jelszo123"
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'nev')).toBeTruthy();
    });

    it('400-as státuszkódot kell kapni, ha a név szám', async () => {
        const res = await request(app)
            .post('/api/felhasznalok/register')
            .send({
                "nev": 123,
                "email": "teszt@example.com",
                "jelszo": "jelszo123"
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'nev')).toBeTruthy();
    });

    it('400-as státuszkódot kell kapni, ha az email hiányzik', async () => {
        const res = await request(app)
            .post('/api/felhasznalok/register')
            .send({
                "nev": "Teszt Felhasználó",
                "email": "",
                "jelszo": "jelszo123"
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'email')).toBeTruthy();
    });

    it('400-as státuszkódot kell kapni, ha az email formátuma helytelen', async () => {
        const res = await request(app)
            .post('/api/felhasznalok/register')
            .send({
                "nev": "Teszt Felhasználó",
                "email": "nemvalos-email",
                "jelszo": "jelszo123"
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'email')).toBeTruthy();
    });

    it('400-as státuszkódot kell kapni, ha a jelszó hiányzik', async () => {
        const res = await request(app)
            .post('/api/felhasznalok/register')
            .send({
                "nev": "Teszt Felhasználó",
                "email": "teszt@example.com",
                "jelszo": ""
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'jelszo')).toBeTruthy();
    });

    it('400-as státuszkódot kell kapni, ha a jelszó rövidebb mint 8 karakter', async () => {
        const res = await request(app)
            .post('/api/felhasznalok/register')
            .send({
                "nev": "Teszt Felhasználó",
                "email": "teszt@example.com",
                "jelszo": "1234567"
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'jelszo')).toBeTruthy();
    });

    it('400-as státuszkódot kell kapni, ha az email már regisztrált', async () => {
        bcrypt.hash = jest.fn().mockResolvedValue('$2b$10$mockedHash');

        userModel.insertNewUser = jest.fn((userData, callback) => {
            const error = new Error('Duplicate entry');
            error.code = 'ER_DUP_ENTRY';
            callback(error, null);
        });

        const res = await request(app)
            .post('/api/felhasznalok/register')
            .send({
                "nev": "Teszt Felhasználó",
                "email": "teszt.elek@test.hu",
                "jelszo": "jelszo123"
            });

        expect(res.status).toBe(400);
        expect(res.body.valasz).toBe("Ezzel az email címmel már regisztráltak");
    });

    it('500-as státuszkódot kell kapni adatbázis hiba esetén', async () => {
        bcrypt.hash = jest.fn().mockResolvedValue('$2b$10$mockedHash');

        userModel.insertNewUser = jest.fn((userData, callback) => {
            callback(new Error('Adatbázis kapcsolat hiba'), null);
        });

        const res = await request(app)
            .post('/api/felhasznalok/register')
            .send({
                "nev": "Teszt Felhasználó",
                "email": "ujfelhasznalo@example.com",
                "jelszo": "jelszo123"
            });

        expect(res.status).toBe(500);
    });
});

describe('POST /api/felhasznalok/login tesztelése (MOCKOLVA)', () => {
    
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('200-as státuszkódot kell kapni sikeres bejelentkezés esetén', async () => {
        userModel.loginUser = jest.fn((email, callback) => {
            callback(null, [{
                id: 1,
                nev: 'Teszt Elek',
                email: 'teszt.elek@test.hu',
                jelszo: '$2b$10$BPUuaZk4AnPootJPODvAAeQqICAJSlA3pMyOwJRBRmQmlJqlo1Iwy'
            }]);
        });

        bcrypt.compare = jest.fn().mockResolvedValue(true);

        jwt.sign = jest.fn()
            .mockReturnValueOnce('mocked_access_token_123')
            .mockReturnValueOnce('mocked_refresh_token_456');

        const res = await request(app)
            .post('/api/felhasznalok/login')
            .send({
                "email": "teszt.elek@test.hu",
                "jelszo": "jelszo123"
            });

        expect(res.status).toBe(200);
        expect(res.body.uzenet).toBe("Sikeres bejelentkezés");
        expect(res.body.token).toBe('mocked_access_token_123');
        expect(res.body.refreshToken).toBe('mocked_refresh_token_456');
    });

    it('401-es státuszkódot kell kapni hibás email esetén', async () => {
        userModel.loginUser = jest.fn((email, callback) => {
            callback(null, []);
        });

        const res = await request(app)
            .post('/api/felhasznalok/login')
            .send({
                "email": "nemletezik@example.com",
                "jelszo": "jelszo123"
            });

        expect(res.status).toBe(401);
        expect(res.body.uzenet).toBe("Hibás email vagy jelszó");
    });

    it('401-es státuszkódot kell kapni hibás jelszó esetén', async () => {
        userModel.loginUser = jest.fn((email, callback) => {
            callback(null, [{
                id: 1,
                nev: 'Teszt Elek',
                email: 'teszt.elek@test.hu',
                jelszo: '$2b$10$BPUuaZk4AnPootJPODvAAeQqICAJSlA3pMyOwJRBRmQmlJqlo1Iwy'
            }]);
        });

        bcrypt.compare = jest.fn().mockResolvedValue(false);

        const res = await request(app)
            .post('/api/felhasznalok/login')
            .send({
                "email": "teszt.elek@test.hu",
                "jelszo": "hibasjelszo"
            });

        expect(res.status).toBe(401);
        expect(res.body.uzenet).toBe("Hibás email vagy jelszó");
    });

    it('400-as státuszkódot kell kapni hiányzó email esetén', async () => {
        const res = await request(app)
            .post('/api/felhasznalok/login')
            .send({
                "email": "",
                "jelszo": "jelszo123"
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'email')).toBeTruthy();
    });

    it('400-as státuszkódot kell kapni hiányzó jelszó esetén', async () => {
        const res = await request(app)
            .post('/api/felhasznalok/login')
            .send({
                "email": "teszt@example.com",
                "jelszo": ""
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'jelszo')).toBeTruthy();
    });
});

describe('POST /api/felhasznalok/refresh tesztelése (MOCKOLVA)', () => {
    
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('200-as státuszkódot kell kapni sikeres token frissítés esetén', async () => {
        const mockDecodedPayload = { id: 1, email: 'teszt.elek@test.hu' };

        jwt.verify = jest.fn((token, secret, callback) => {
            callback(null, mockDecodedPayload);
        });

        jwt.sign = jest.fn(() => 'new_access_token_789');

        const res = await request(app)
            .post('/api/felhasznalok/refresh')
            .send({
                "refreshToken": 'valid_refresh_token_123'
            });

        expect(res.status).toBe(200);
        expect(res.body.token).toBe('new_access_token_789');
    });

    it('401-es státuszkódot kell kapni hiányzó refresh token esetén', async () => {
        const res = await request(app)
            .post('/api/felhasznalok/refresh')
            .send({});

        expect(res.status).toBe(401);
        expect(res.body.uzenet).toBe("Refresh token hiányzik");
    });

    it('403-as státuszkódot kell kapni érvénytelen refresh token esetén', async () => {
        jwt.verify = jest.fn((token, secret, callback) => {
            callback(new Error('Invalid token'), null);
        });

        const res = await request(app)
            .post('/api/felhasznalok/refresh')
            .send({
                "refreshToken": "ervenytelentoken123"
            });

        expect(res.status).toBe(403);
        expect(res.body.uzenet).toBe("Érvénytelen refresh token");
    });
});
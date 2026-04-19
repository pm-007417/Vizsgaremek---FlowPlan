const request = require('supertest');
const express = require('express');
const userController = require('../controllers/userController');
const { updateProfileValidator, updatePasswordValidator } = require('../validators/userValidators');
const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');

jest.mock('../models/userModel');
jest.mock('bcrypt');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    req.user = { id: 1, email: 'teszt.elek@test.hu' };
    next();
});

app.put('/api/felhasznalok/profile', updateProfileValidator, userController.updateProfile);
app.put('/api/felhasznalok/password', updatePasswordValidator, userController.updatePassword);

describe('PUT /api/felhasznalok/profile tesztelése (MOCKOLVA)', () => {
    
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('200-as státuszkódot kell kapni sikeres profil módosítás esetén', async () => {
        userModel.updateUserProfile = jest.fn((userId, nev, email, callback) => {
            callback(null);
        });

        const res = await request(app)
            .put('/api/felhasznalok/profile')
            .send({
                "nev": "Teszt Elek Módosított",
                "email": "teszt.elek@test.hu"
            });

        expect(res.status).toBe(200);
        expect(res.body.uzenet).toBe("Profil sikeresen frissítve");
        expect(userModel.updateUserProfile).toHaveBeenCalledWith(1, 'Teszt Elek Módosított', 'teszt.elek@test.hu', expect.any(Function));
    });

    it('400-as státuszkódot kell kapni hiányzó név esetén', async () => {
        const res = await request(app)
            .put('/api/felhasznalok/profile')
            .send({
                "nev": "",
                "email": "teszt.elek@test.hu"
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'nev')).toBeTruthy();
    });

    it('400-as státuszkódot kell kapni, ha a név szám', async () => {
        const res = await request(app)
            .put('/api/felhasznalok/profile')
            .send({
                "nev": 123,
                "email": "teszt.elek@test.hu"
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'nev')).toBeTruthy();
    });

    it('400-as státuszkódot kell kapni hiányzó email esetén', async () => {
        const res = await request(app)
            .put('/api/felhasznalok/profile')
            .send({
                "nev": "Teszt Elek",
                "email": ""
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'email')).toBeTruthy();
    });

    it('400-as státuszkódot kell kapni érvénytelen email formátum esetén', async () => {
        const res = await request(app)
            .put('/api/felhasznalok/profile')
            .send({
                "nev": "Teszt Elek",
                "email": "nemvalos-email"
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'email')).toBeTruthy();
    });

    it('500-as státuszkódot kell kapni adatbázis hiba esetén', async () => {
        userModel.updateUserProfile = jest.fn((userId, nev, email, callback) => {
            callback(new Error('Adatbázis kapcsolat hiba'));
        });

        const res = await request(app)
            .put('/api/felhasznalok/profile')
            .send({
                "nev": "Teszt Elek",
                "email": "teszt.elek@test.hu"
            });

        expect(res.status).toBe(500);
    });
});

describe('PUT /api/felhasznalok/password tesztelése (MOCKOLVA)', () => {
    
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('400-as státuszkódot kell kapni hiányzó régi jelszó esetén', async () => {
        const res = await request(app)
            .put('/api/felhasznalok/password')
            .send({
                "regiJelszo": "",
                "ujJelszo": "ujjelszo456"
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'regiJelszo')).toBeTruthy();
    });

    it('400-as státuszkódot kell kapni hiányzó új jelszó esetén', async () => {
        const res = await request(app)
            .put('/api/felhasznalok/password')
            .send({
                "regiJelszo": "jelszo123",
                "ujJelszo": ""
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'ujJelszo')).toBeTruthy();
    });

    it('400-as státuszkódot kell kapni, ha az új jelszó rövidebb mint 8 karakter', async () => {
        const res = await request(app)
            .put('/api/felhasznalok/password')
            .send({
                "regiJelszo": "jelszo123",
                "ujJelszo": "12345"
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'ujJelszo')).toBeTruthy();
    });

    it('401-es státuszkódot kell kapni helytelen jelenlegi jelszó esetén', async () => {
        userModel.selectUserByEmail = jest.fn((email, callback) => {
            callback(null, [{
                id: 1,
                nev: 'Teszt Elek',
                email: 'teszt.elek@test.hu',
                jelszo: '$2b$10$BPUuaZk4AnPootJPODvAAeQqICAJSlA3pMyOwJRBRmQmlJqlo1Iwy'
            }]);
        });

        bcrypt.compare = jest.fn().mockResolvedValue(false);

        const res = await request(app)
            .put('/api/felhasznalok/password')
            .send({
                "regiJelszo": "hibasjelszo",
                "ujJelszo": "ujjelszo456"
            });

        expect(res.status).toBe(401);
        expect(res.body.uzenet).toBe("Helytelen a jelenlegi jelszó");
    });

    it('400-as státuszkódot kell kapni, ha az új jelszó megegyezik a jelenlegivel', async () => {
        userModel.selectUserByEmail = jest.fn((email, callback) => {
            callback(null, [{
                id: 1,
                nev: 'Teszt Elek',
                email: 'teszt.elek@test.hu',
                jelszo: '$2b$10$BPUuaZk4AnPootJPODvAAeQqICAJSlA3pMyOwJRBRmQmlJqlo1Iwy'
            }]);
        });

        bcrypt.compare = jest.fn()
            .mockResolvedValueOnce(true)  
            .mockResolvedValueOnce(true); 

        const res = await request(app)
            .put('/api/felhasznalok/password')
            .send({
                "regiJelszo": "jelszo123",
                "ujJelszo": "jelszo123"
            });

        expect(res.status).toBe(400);
        expect(res.body.uzenet).toBe("Az új jelszó nem egyezhet meg a jelenlegivel");
    });

    it('200-as státuszkódot kell kapni sikeres jelszó módosítás esetén', async () => {
        userModel.selectUserByEmail = jest.fn((email, callback) => {
            callback(null, [{
                id: 1,
                nev: 'Teszt Elek',
                email: 'teszt.elek@test.hu',
                jelszo: '$2b$10$BPUuaZk4AnPootJPODvAAeQqICAJSlA3pMyOwJRBRmQmlJqlo1Iwy'
            }]);
        });

        bcrypt.compare = jest.fn()
            .mockResolvedValueOnce(true)  
            .mockResolvedValueOnce(false); 

        bcrypt.hash = jest.fn().mockResolvedValue('$2b$10$newHashedPassword123456789');

        userModel.updateUserPassword = jest.fn((userId, hashedPassword, callback) => {
            callback(null);
        });

        const res = await request(app)
            .put('/api/felhasznalok/password')
            .send({
                "regiJelszo": "jelszo123",
                "ujJelszo": "ujjelszo456"
            });

        expect(res.status).toBe(200);
        expect(res.body.uzenet).toBe("Jelszó sikeresen módosítva");
        expect(bcrypt.hash).toHaveBeenCalledWith('ujjelszo456', 10);
        expect(userModel.updateUserPassword).toHaveBeenCalledWith(1, '$2b$10$newHashedPassword123456789', expect.any(Function));
    });

    it('404-es státuszkódot kell kapni, ha a felhasználó nem található', async () => {
        userModel.selectUserByEmail = jest.fn((email, callback) => {
            callback(null, []);
        });

        const res = await request(app)
            .put('/api/felhasznalok/password')
            .send({
                "regiJelszo": "jelszo123",
                "ujJelszo": "ujjelszo456"
            });

        expect(res.status).toBe(404);
        expect(res.body.uzenet).toBe("Felhasználó nem található");
    });

    it('500-as státuszkódot kell kapni adatbázis hiba esetén', async () => {
        userModel.selectUserByEmail = jest.fn((email, callback) => {
            callback(null, [{
                id: 1,
                nev: 'Teszt Elek',
                email: 'teszt.elek@test.hu',
                jelszo: '$2b$10$BPUuaZk4AnPootJPODvAAeQqICAJSlA3pMyOwJRBRmQmlJqlo1Iwy'
            }]);
        });

        bcrypt.compare = jest.fn()
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(false);

        bcrypt.hash = jest.fn().mockResolvedValue('$2b$10$newHashedPassword');

        userModel.updateUserPassword = jest.fn((userId, hashedPassword, callback) => {
            callback(new Error('Adatbázis kapcsolat hiba'));
        });

        const res = await request(app)
            .put('/api/felhasznalok/password')
            .send({
                "regiJelszo": "jelszo123",
                "ujJelszo": "ujjelszo456"
            });

        expect(res.status).toBe(500);
    });
});
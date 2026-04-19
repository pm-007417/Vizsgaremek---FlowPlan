const request = require('supertest');
const express = require('express');
const companyController = require('../controllers/companyController');
const { createCompanyValidator, addMemberValidator } = require('../validators/companyValidators');
const companyModel = require('../models/companyModel');
const userModel = require('../models/userModel');

jest.mock('../models/companyModel');
jest.mock('../models/userModel');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    req.user = { id: 1 };
    next();
});

app.post('/api/tarsasagok/company', createCompanyValidator, companyController.postCreateCompany);
app.post('/api/tarsasagok/:id/tagok', addMemberValidator, companyController.addMemberToCompany);

describe('POST /api/tarsasagok/company tesztelése (MOCKOLVA)', () => {
    
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('201-es státuszkódot kell kapni sikeres társaság létrehozás esetén', async () => {
        companyModel.createCompany = jest.fn((data, callback) => {
            callback(null, { 
                insertId: 7,
                tarsasag_id: 7,
                uzenet: 'Társaság és alapító tagság sikeresen létrehozva'
            });
        });

        const res = await request(app)
            .post('/api/tarsasagok/company')
            .send({
                "nev": "Teszt Társaság Kft."
            });

        expect(res.status).toBe(201);
        expect(res.body.uzenet).toBe("Új társaság sikeresen létrehozva");
        expect(res.body.tarsasag_id).toBe(7);
        expect(companyModel.createCompany).toHaveBeenCalledWith(
            ["Teszt Társaság Kft.", 1],
            expect.any(Function)
        );
    });

    it('400-as státuszkódot kell kapni hiányzó név esetén', async () => {
        const res = await request(app)
            .post('/api/tarsasagok/company')
            .send({
                "nev": ""
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak).toBeDefined();
        expect(res.body.hibak.find(err => err.mezo === 'nev')).toBeTruthy();
    });

    it('400-as státuszkódot kell kapni, ha a név szám', async () => {
        const res = await request(app)
            .post('/api/tarsasagok/company')
            .send({
                "nev": 123
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'nev')).toBeTruthy();
    });

    it('500-as státuszkódot kell kapni adatbázis hiba esetén', async () => {
        companyModel.createCompany = jest.fn((data, callback) => {
            callback(new Error('Adatbázis hiba'), null);
        });

        const res = await request(app)
            .post('/api/tarsasagok/company')
            .send({
                "nev": "Teszt Társaság Kft."
            });

        expect(res.status).toBe(500);
    });
});

describe('POST /api/tarsasagok/:id/tagok tesztelése (MOCKOLVA)', () => {
    
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('201-es státuszkódot kell kapni sikeres tag hozzáadás esetén', async () => {
        companyModel.getUserRoleInCompany = jest.fn()
            .mockImplementationOnce((tarsasagId, felhasznaloId, callback) => {
                callback(null, [{ szerepkor: 'admin' }]);
            })
            .mockImplementationOnce((tarsasagId, felhasznaloId, callback) => {
                callback(null, []); 
            });

        userModel.selectUserByEmail = jest.fn((email, callback) => {
            callback(null, [{ id: 2, email: 'gipsz.jakab@test.hu' }]);
        });

        companyModel.insertMember = jest.fn((data, callback) => {
            callback(null, { affectedRows: 1 });
        });

        const res = await request(app)
            .post('/api/tarsasagok/1/tagok')
            .send({
                "email": "gipsz.jakab@test.hu",
                "szerepkor": "manager"
            });

        expect(res.status).toBe(201);
        expect(res.body.uzenet).toBe("Tag sikeresen hozzáadva");
    });

    it('404-es státuszkódot kell kapni hiányzó társaság azonosító esetén', async () => {
        const res = await request(app)
            .post('/api/tarsasagok/tagok')
            .send({
                "email": "teszt@example.com",
                "szerepkor": "manager"
            });

        expect(res.status).toBe(404);
    });

    it('400-as státuszkódot kell kapni érvénytelen társaság azonosító esetén', async () => {
        const res = await request(app)
            .post('/api/tarsasagok/teszt/tagok')
            .send({
                "email": "teszt@example.com",
                "szerepkor": "manager"
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'id')).toBeTruthy();
    });

    it('400-as státuszkódot kell kapni hiányzó email esetén', async () => {
        const res = await request(app)
            .post('/api/tarsasagok/1/tagok')
            .send({
                "email": "",
                "szerepkor": "manager"
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'email')).toBeTruthy();
    });

    it('400-as státuszkódot kell kapni érvénytelen email formátum esetén', async () => {
        const res = await request(app)
            .post('/api/tarsasagok/1/tagok')
            .send({
                "email": "nemvalos-email",
                "szerepkor": "manager"
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'email')).toBeTruthy();
    });

    it('400-as státuszkódot kell kapni hiányzó szerepkör esetén', async () => {
        const res = await request(app)
            .post('/api/tarsasagok/1/tagok')
            .send({
                "email": "teszt@example.com",
                "szerepkor": ""
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'szerepkor')).toBeTruthy();
    });

    it('400-as státuszkódot kell kapni érvénytelen szerepkör esetén', async () => {
        const res = await request(app)
            .post('/api/tarsasagok/1/tagok')
            .send({
                "email": "teszt@example.com",
                "szerepkor": "ervenytelen"
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'szerepkor')).toBeTruthy();
    });

    it('404-es státuszkódot kell kapni, ha a felhasználó email nem létezik', async () => {
        companyModel.getUserRoleInCompany = jest.fn((tarsasagId, felhasznaloId, callback) => {
            callback(null, [{ szerepkor: 'admin' }]);
        });

        userModel.selectUserByEmail = jest.fn((email, callback) => {
            callback(null, []);
        });

        const res = await request(app)
            .post('/api/tarsasagok/1/tagok')
            .send({
                "email": "nemletezik@example.com",
                "szerepkor": "manager"
            });

        expect(res.status).toBe(404);
        expect(res.body.uzenet).toBe("A megadott email címmel nem található felhasználó");
    });

    it('409-es státuszkódot kell kapni, ha már tagja a társaságnak', async () => {
        companyModel.getUserRoleInCompany = jest.fn()
            .mockImplementationOnce((tarsasagId, felhasznaloId, callback) => {
                callback(null, [{ szerepkor: 'admin' }]);
            })
            .mockImplementationOnce((tarsasagId, felhasznaloId, callback) => {
                // User 2 MÁR tagja
                callback(null, [{ szerepkor: 'manager' }]);
            });

        userModel.selectUserByEmail = jest.fn((email, callback) => {
            callback(null, [{ id: 2, email: 'gipsz.jakab@test.hu' }]);
        });

        const res = await request(app)
            .post('/api/tarsasagok/1/tagok')
            .send({
                "email": "gipsz.jakab@test.hu",
                "szerepkor": "tag"
            });

        expect(res.status).toBe(409);
        expect(res.body.uzenet).toBe("Ez a felhasználó már tagja a társaságnak");
    });

    it('403-as státuszkódot kell kapni, ha nincs admin jogosultság', async () => {
        const testApp = express();
        testApp.use(express.json());
        
        testApp.use((req, res, next) => {
            req.user = { id: 3 };
            next();
        });
        
        testApp.post('/api/tarsasagok/:id/tagok', addMemberValidator, companyController.addMemberToCompany);

        companyModel.getUserRoleInCompany = jest.fn((tarsasagId, felhasznaloId, callback) => {
            callback(null, [{ szerepkor: 'tag' }]);
        });

        const res = await request(testApp)
            .post('/api/tarsasagok/1/tagok')
            .send({
                "email": "bir.tamas@test.hu",
                "szerepkor": "manager"
            });

        expect(res.status).toBe(403);
        expect(res.body.uzenet).toBe("Csak adminisztrátorok adhatnak hozzá tagokat");
    });
});
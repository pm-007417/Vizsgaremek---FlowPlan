const request = require('supertest');
const express = require('express');
const companyController = require('../controllers/companyController');
const { deleteCompanyHardValidator } = require('../validators/companyValidators');
const companyModel = require('../models/companyModel');

jest.mock('../models/companyModel');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    req.user = { id: 1 };
    next();
});

app.delete('/api/tarsasagok/:id/torles', deleteCompanyHardValidator, companyController.deleteCompanyHard);

describe('DELETE /api/tarsasagok/:id/torles tesztelése (MOCKOLVA)', () => {
    
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('404-es státuszkódot kell kapni hiányzó társaság azonosító esetén', async () => {
        const res = await request(app)
            .delete('/api/tarsasagok/torles');

        expect(res.status).toBe(404);
    });

    it('400-as státuszkódot kell kapni érvénytelen társaság azonosító esetén', async () => {
        const res = await request(app)
            .delete('/api/tarsasagok/teszt/torles');

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'id')).toBeTruthy();
    });

    it('403-as státuszkódot kell kapni, ha nem tagja a társaságnak', async () => {
        companyModel.getUserRoleInCompany = jest.fn((tarsasagId, felhasznaloId, callback) => {
            callback(null, []); 
        });

        const res = await request(app)
            .delete('/api/tarsasagok/999/torles');

        expect(res.status).toBe(403);
        expect(res.body.uzenet).toBe("Nem tagja a társaságnak");
    });

    it('403-as státuszkódot kell kapni, ha nem admin', async () => {
        const testApp = express();
        testApp.use(express.json());
        testApp.use((req, res, next) => {
            req.user = { id: 2 }; 
            next();
        });
        testApp.delete('/api/tarsasagok/:id/torles', deleteCompanyHardValidator, companyController.deleteCompanyHard);

        companyModel.getUserRoleInCompany = jest.fn((tarsasagId, felhasznaloId, callback) => {
            callback(null, [{ szerepkor: 'manager' }]);
        });

        const res = await request(testApp)
            .delete('/api/tarsasagok/1/torles');

        expect(res.status).toBe(403);
        expect(res.body.uzenet).toBe("Csak az alapító törölheti a társaságot");
    });

    it('403-as státuszkódot kell kapni, ha nem alapító (de admin)', async () => {
        const testApp = express();
        testApp.use(express.json());
        testApp.use((req, res, next) => {
            req.user = { id: 2 }; 
            next();
        });
        testApp.delete('/api/tarsasagok/:id/torles', deleteCompanyHardValidator, companyController.deleteCompanyHard);

        companyModel.getUserRoleInCompany = jest.fn((tarsasagId, felhasznaloId, callback) => {
            callback(null, [{ szerepkor: 'admin' }]);
        });

        companyModel.deleteCompanyHard = jest.fn((data, callback) => {
            callback(null, { affectedRows: 0 });
        });

        const res = await request(testApp)
            .delete('/api/tarsasagok/2/torles');

        expect(res.status).toBe(403);
        expect(res.body.uzenet).toBe("Nem létezik a társaság vagy nem Ön az alapító");
    });

    it('200-as státuszkódot kell kapni sikeres társaság törlés esetén', async () => {
        companyModel.getUserRoleInCompany = jest.fn((tarsasagId, felhasznaloId, callback) => {
            callback(null, [{ szerepkor: 'admin' }]);
        });

        companyModel.deleteCompanyHard = jest.fn((data, callback) => {
            callback(null, { affectedRows: 1 });
        });

        const res = await request(app)
            .delete('/api/tarsasagok/1/torles');

        expect(res.status).toBe(200);
        expect(res.body.uzenet).toBe("Társaság véglegesen törölve");
        expect(companyModel.deleteCompanyHard).toHaveBeenCalledWith(['1', 1], expect.any(Function));
    });

    it('500-as státuszkódot kell kapni adatbázis hiba esetén', async () => {
        companyModel.getUserRoleInCompany = jest.fn((tarsasagId, felhasznaloId, callback) => {
            callback(null, [{ szerepkor: 'admin' }]);
        });

        companyModel.deleteCompanyHard = jest.fn((data, callback) => {
            callback(new Error('Adatbázis kapcsolat hiba'), null);
        });

        const res = await request(app)
            .delete('/api/tarsasagok/1/torles');

        expect(res.status).toBe(500);
    });
});
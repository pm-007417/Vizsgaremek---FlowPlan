const request = require('supertest');
const express = require('express');
const companyController = require('../controllers/companyController');
const {
    updateCompanyNameValidator,
    updateMemberRoleValidator,
    changeFounderValidator,
    deactivateMemberValidator,
    activateMemberValidator,
    companyStatusValidator
} = require('../validators/companyValidators');
const companyModel = require('../models/companyModel');

jest.mock('../models/companyModel');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    req.user = { id: 1 };
    next();
});

app.put('/api/tarsasagok/company/:id', updateCompanyNameValidator, companyController.putUpdateCompanyName);
app.put('/api/tarsasagok/:id/tagok/:felhasznaloId', updateMemberRoleValidator, companyController.updateMemberRole);
app.put('/api/tarsasagok/:tarsasag_id/alapito', changeFounderValidator, companyController.changeFounder);
app.put('/api/tarsasagok/:tarsasag_id/member/:felhasznaloId/deactivate', deactivateMemberValidator, companyController.deactivateMember);
app.put('/api/tarsasagok/:tarsasag_id/member/:felhasznaloId/activate', activateMemberValidator, companyController.activateMember);
app.put('/api/tarsasagok/:tarsasag_id/deaktival', companyStatusValidator, companyController.deactivateCompany);
app.put('/api/tarsasagok/:tarsasag_id/aktival', companyStatusValidator, companyController.activateCompany);

describe('PUT /api/tarsasagok/company/:id tesztelése (MOCKOLVA)', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('200-as státuszkódot kell kapni sikeres társaság név módosítás esetén', async () => {
        companyModel.getUserRoleInCompany = jest.fn((tarsasagId, felhasznaloId, callback) => {
            callback(null, [{ szerepkor: 'admin' }]);
        });

        companyModel.updateCompanyName = jest.fn((data, callback) => {
            callback(null, { affectedRows: 1 });
        });

        const res = await request(app)
            .put('/api/tarsasagok/company/1')
            .send({
                "nev": "Módosított Társaság Kft."
            });

        expect(res.status).toBe(200);
        expect(res.body.uzenet).toBe("Társaság neve sikeresen módosítva");
    });

    it('404-es státuszkódot kell kapni hiányzó társaság azonosító esetén', async () => {
        const res = await request(app)
            .put('/api/tarsasagok/company/')
            .send({
                "nev": "Módosított Társaság Kft."
            });

        expect(res.status).toBe(404);
    });

    it('400-as státuszkódot kell kapni érvénytelen társaság azonosító esetén', async () => {
        const res = await request(app)
            .put('/api/tarsasagok/company/teszt')
            .send({
                "nev": "Módosított Társaság Kft."
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'id')).toBeTruthy();
    });

    it('400-as státuszkódot kell kapni hiányzó név esetén', async () => {
        const res = await request(app)
            .put('/api/tarsasagok/company/1')
            .send({
                "nev": ""
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'nev')).toBeTruthy();
    });

    it('400-as státuszkódot kell kapni, ha a név szám', async () => {
        const res = await request(app)
            .put('/api/tarsasagok/company/1')
            .send({
                "nev": 123
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'nev')).toBeTruthy();
    });

    it('403-as státuszkódot kell kapni, ha nem tagja a társaságnak', async () => {
        companyModel.getUserRoleInCompany = jest.fn((tarsasagId, felhasznaloId, callback) => {
            callback(null, []);
        });

        const res = await request(app)
            .put('/api/tarsasagok/company/999')
            .send({
                "nev": "Módosított Társaság Kft."
            });

        expect(res.status).toBe(403);
        expect(res.body.uzenet).toBe("Nem tagja a társaságnak");
    });

    it('403-as státuszkódot kell kapni, ha nem admin', async () => {
        const testApp = express();
        testApp.use(express.json());
        testApp.use((req, res, next) => {
            req.user = { id: 3 }; 
            next();
        });
        testApp.put('/api/tarsasagok/company/:id', updateCompanyNameValidator, companyController.putUpdateCompanyName);

        companyModel.getUserRoleInCompany = jest.fn((tarsasagId, felhasznaloId, callback) => {
            callback(null, [{ szerepkor: 'tag' }]);
        });

        const res = await request(testApp)
            .put('/api/tarsasagok/company/1')
            .send({
                "nev": "Módosított Társaság Kft."
            });

        expect(res.status).toBe(403);
        expect(res.body.uzenet).toBe("Nincs jogosultsága a név módosításához");
    });
});

describe('PUT /api/tarsasagok/:id/tagok/:felhasznaloId tesztelése (MOCKOLVA)', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('400-as státuszkódot kell kapni, ha saját szerepkörét próbálja módosítani', async () => {
        const res = await request(app)
            .put('/api/tarsasagok/1/tagok/1')
            .send({
                "szerepkor": "tag"
            });

        expect(res.status).toBe(400);
        expect(res.body.uzenet).toBe("Nem módosíthatja saját szerepkörét! Módosításához kérjük, forduljon adminisztrátorhoz/alapítóhoz!.");
    });

    it('200-as státuszkódot kell kapni sikeres szerepkör módosítás esetén', async () => {
        companyModel.getUserRoleInCompany = jest.fn()
            .mockImplementationOnce((tarsasagId, felhasznaloId, callback) => {
                callback(null, [{ szerepkor: 'admin' }]);
            })
            .mockImplementationOnce((tarsasagId, felhasznaloId, callback) => {
                callback(null, [{ szerepkor: 'manager' }]);
            });

        companyModel.updateMemberRole = jest.fn((tarsasagId, felhasznaloId, szerepkor, callback) => {
            callback(null, { affectedRows: 1 });
        });

        const res = await request(app)
            .put('/api/tarsasagok/1/tagok/2')
            .send({
                "szerepkor": "tag"
            });

        expect(res.status).toBe(200);
        expect(res.body.uzenet).toBe("Szerepkör frissítve");
    });

    it('400-as státuszkódot kell kapni érvénytelen szerepkör esetén', async () => {
        const res = await request(app)
            .put('/api/tarsasagok/1/tagok/2')
            .send({
                "szerepkor": "ervenytelen"
            });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'szerepkor')).toBeTruthy();
    });

    it('403-as státuszkódot kell kapni, ha nem tagja a társaságnak', async () => {
        companyModel.getUserRoleInCompany = jest.fn((tarsasagId, felhasznaloId, callback) => {
            callback(null, []);
        });

        const res = await request(app)
            .put('/api/tarsasagok/999/tagok/2')
            .send({
                "szerepkor": "manager"
            });

        expect(res.status).toBe(403);
        expect(res.body.uzenet).toBe("Nem tagja a társaságnak");
    });

    it('403-as státuszkódot kell kapni, ha nincs jogosultsága', async () => {
        const testApp = express();
        testApp.use(express.json());
        testApp.use((req, res, next) => {
            req.user = { id: 3 }; 
            next();
        });
        testApp.put('/api/tarsasagok/:id/tagok/:felhasznaloId', updateMemberRoleValidator, companyController.updateMemberRole);

        companyModel.getUserRoleInCompany = jest.fn((tarsasagId, felhasznaloId, callback) => {
            callback(null, [{ szerepkor: 'tag' }]);
        });

        const res = await request(testApp)
            .put('/api/tarsasagok/1/tagok/2')
            .send({
                "szerepkor": "admin"
            });

        expect(res.status).toBe(403);
        expect(res.body.uzenet).toBe("Nincs jogosultsága szerepkör módosítására");
    });

    it('404-es státuszkódot kell kapni, ha a felhasználó nem található', async () => {
        companyModel.getUserRoleInCompany = jest.fn()
            .mockImplementationOnce((tarsasagId, felhasznaloId, callback) => {
                callback(null, [{ szerepkor: 'admin' }]);
            })
            .mockImplementationOnce((tarsasagId, felhasznaloId, callback) => {
                callback(null, []);
            });

        const res = await request(app)
            .put('/api/tarsasagok/1/tagok/999')
            .send({
                "szerepkor": "manager"
            });

        expect(res.status).toBe(404);
        expect(res.body.uzenet).toBe("Felhasználó nem található a társaságban");
    });

    it('403-as státuszkódot kell kapni, ha manager admin-t próbál módosítani', async () => {
        const testApp = express();
        testApp.use(express.json());
        testApp.use((req, res, next) => {
            req.user = { id: 2 }; 
            next();
        });
        testApp.put('/api/tarsasagok/:id/tagok/:felhasznaloId', updateMemberRoleValidator, companyController.updateMemberRole);

        companyModel.getUserRoleInCompany = jest.fn()
            .mockImplementationOnce((tarsasagId, felhasznaloId, callback) => {
                callback(null, [{ szerepkor: 'manager' }]);
            })
            .mockImplementationOnce((tarsasagId, felhasznaloId, callback) => {
                callback(null, [{ szerepkor: 'admin' }]);
            });

        const res = await request(testApp)
            .put('/api/tarsasagok/1/tagok/1')
            .send({
                "szerepkor": "tag"
            });

        expect(res.status).toBe(403);
        expect(res.body.uzenet).toBe("Manager csak tag szerepkörű felhasználókat módosíthat");
    });
});

describe('PUT /api/tarsasagok/:tarsasag_id/deaktival tesztelése (MOCKOLVA)', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('200-as státuszkódot kell kapni sikeres társaság deaktiválás esetén', async () => {
        companyModel.getUserRoleInCompany = jest.fn((tarsasagId, felhasznaloId, callback) => {
            callback(null, [{ szerepkor: 'admin' }]);
        });

        companyModel.deactivateCompany = jest.fn((tarsasagId, felhasznaloId, callback) => {
            callback(null, { affectedRows: 1 });
        });

        const res = await request(app)
            .put('/api/tarsasagok/1/deaktival');

        expect(res.status).toBe(200);
        expect(res.body.uzenet).toBe("Társaság sikeresen deaktiválva");
    });

    it('403-as státuszkódot kell kapni, ha nem admin', async () => {
        const testApp = express();
        testApp.use(express.json());
        testApp.use((req, res, next) => {
            req.user = { id: 2 };
            next();
        });
        testApp.put('/api/tarsasagok/:tarsasag_id/deaktival', companyStatusValidator, companyController.deactivateCompany);

        companyModel.getUserRoleInCompany = jest.fn((tarsasagId, felhasznaloId, callback) => {
            callback(null, [{ szerepkor: 'manager' }]);
        });

        const res = await request(testApp)
            .put('/api/tarsasagok/1/deaktival');

        expect(res.status).toBe(403);
        expect(res.body.uzenet).toBe("Csak admin deaktiválhatja a társaságot");
    });
});

describe('PUT /api/tarsasagok/:tarsasag_id/aktival tesztelése (MOCKOLVA)', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('200-as státuszkódot kell kapni sikeres társaság aktiválás esetén', async () => {
        companyModel.getUserRoleInCompany = jest.fn((tarsasagId, felhasznaloId, callback) => {
            callback(null, [{ szerepkor: 'admin' }]);
        });

        companyModel.activateCompany = jest.fn((tarsasagId, felhasznaloId, callback) => {
            callback(null, { affectedRows: 1 });
        });

        const res = await request(app)
            .put('/api/tarsasagok/1/aktival');

        expect(res.status).toBe(200);
        expect(res.body.uzenet).toBe("Társaság sikeresen aktiválva");
    });
});

describe('PUT /api/tarsasagok/:tarsasag_id/member/:felhasznaloId/deactivate tesztelése (MOCKOLVA)', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('400-as státuszkódot kell kapni, ha saját magát próbálja deaktiválni', async () => {
        const res = await request(app)
            .put('/api/tarsasagok/1/member/1/deactivate');

        expect(res.status).toBe(400);
        expect(res.body.uzenet).toBe("Nem deaktiválhatja saját magát!");
    });

    it('200-as státuszkódot kell kapni sikeres tag deaktiválás esetén', async () => {
        companyModel.getUserRoleInCompany = jest.fn()
            .mockImplementationOnce((tarsasagId, felhasznaloId, callback) => {
                callback(null, [{ szerepkor: 'admin' }]);
            })
            .mockImplementationOnce((tarsasagId, felhasznaloId, callback) => {
                callback(null, [{ szerepkor: 'tag' }]);
            });

        companyModel.deactivateMember = jest.fn((felhasznaloId, tarsasagId, modositoId, callback) => {
            callback(null, { affectedRows: 1 });
        });

        const res = await request(app)
            .put('/api/tarsasagok/1/member/3/deactivate');

        expect(res.status).toBe(200);
        expect(res.body.uzenet).toBe("Felhasználó deaktiválva");
    });
});

describe('PUT /api/tarsasagok/:tarsasag_id/alapito tesztelése (MOCKOLVA)', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    const createTestApp = (userId) => {
        const app = express();
        app.use(express.json());

        app.use((req, res, next) => {
            req.user = { id: userId };
            next();
        });

        app.put(
            '/api/tarsasagok/:tarsasag_id/alapito',
            changeFounderValidator,
            companyController.changeFounder
        );

        return app;
    };

    it('200-as státuszkódot kell kapni sikeres alapító módosítás esetén', async () => {
        const app = createTestApp(1);

        companyModel.checkIsFounder = jest.fn((tarsasagId, userId, callback) => {
            callback(null, [{ alapito_id: 1 }]);
        });

        companyModel.changeFounderWithTransaction = jest.fn(
            (tarsasagId, ujAlapitoId, jelenlegiAlapitoId, callback) => {
                callback(null, { success: true });
            }
        );

        const res = await request(app)
            .put('/api/tarsasagok/1/alapito')
            .send({ uj_alapito_id: 2 });

        expect(res.status).toBe(200);
        expect(res.body.uzenet).toBe("Új alapító sikeresen kinevezve");
    });

    it('400-as státuszkódot kell kapni hiányzó új alapító azonosító esetén', async () => {
        const app = createTestApp(1);

        const res = await request(app)
            .put('/api/tarsasagok/1/alapito')
            .send({ uj_alapito_id: "" });

        expect(res.status).toBe(400);
        expect(res.body.hibak.find(err => err.mezo === 'uj_alapito_id')).toBeTruthy();
    });

    it('403-as státuszkódot kell kapni, ha nem az alapító próbálja', async () => {
        const app = createTestApp(2); 

        companyModel.checkIsFounder = jest.fn((tarsasagId, userId, callback) => {
            callback(null, [{ alapito_id: 1 }]);
        });

        const res = await request(app)
            .put('/api/tarsasagok/1/alapito')
            .send({ uj_alapito_id: 3 });

        expect(res.status).toBe(403);
        expect(res.body.uzenet).toBe("Csak a jelenlegi alapító nevezhet ki új alapítót");
    });

    it('404-et ad, ha a társaság nem létezik', async () => {
        const app = createTestApp(1);

        companyModel.checkIsFounder = jest.fn((tarsasagId, userId, callback) => {
            callback(null, []); 
        });

        const res = await request(app)
            .put('/api/tarsasagok/1/alapito')
            .send({ uj_alapito_id: 2 });

        expect(res.status).toBe(404);
        expect(res.body.uzenet).toBe("Társaság nem található");
    });

    it('403-at ad, ha az új alapító nem tag', async () => {
        const app = createTestApp(1);

        companyModel.checkIsFounder = jest.fn((tarsasagId, userId, callback) => {
            callback(null, [{ alapito_id: 1 }]);
        });

        companyModel.changeFounderWithTransaction = jest.fn(
            (tarsasagId, ujAlapitoId, jelenlegiAlapitoId, callback) => {
                callback({ statusCode: 403, message: "Az új alapító nem tagja a társaságnak" });
            }
        );

        const res = await request(app)
            .put('/api/tarsasagok/1/alapito')
            .send({ uj_alapito_id: 999 });

        expect(res.status).toBe(403);
        expect(res.body.uzenet).toBe("Az új alapító nem tagja a társaságnak");
    });

});
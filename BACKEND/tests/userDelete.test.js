const request = require('supertest');
const express = require('express');
const userController = require('../controllers/userController');
const userModel = require('../models/userModel');

jest.mock('../models/userModel');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    req.user = { id: 1 };
    next();
});

app.delete('/api/felhasznalok/profile', userController.deleteUser);

describe('DELETE /api/felhasznalok/profile tesztelése (MOCKOLVA)', () => {
    
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('200-as státuszkódot kell kapni sikeres felhasználó törlés esetén', async () => {
        userModel.deleteUserUser = jest.fn((userId, callback) => {
            callback(null, {
                affectedRows: 1,
                deletedCompanies: 2,
                deletedMemberships: 5
            });
        });

        const res = await request(app)
            .delete('/api/felhasznalok/profile');

        expect(res.status).toBe(200);
        expect(res.body.uzenet).toBe("Felhasználó sikeresen törölve");
        expect(res.body.torolt_tarsasagok).toBe(2);
        expect(res.body.torolt_tagsagok).toBe(5);
        expect(userModel.deleteUserUser).toHaveBeenCalledWith(1, expect.any(Function));
    });

    it('500-as státuszkódot kell kapni adatbázis hiba esetén', async () => {
        userModel.deleteUserUser = jest.fn((userId, callback) => {
            callback(new Error('Adatbázis kapcsolat hiba'), null);
        });

        const res = await request(app)
            .delete('/api/felhasznalok/profile');

        expect(res.status).toBe(500);
    });

    it('200-as státuszkódot kell kapni, ha nincs alapított társaság', async () => {
        userModel.deleteUserUser = jest.fn((userId, callback) => {
            callback(null, {
                affectedRows: 1,
                deletedCompanies: 0,
                deletedMemberships: 3
            });
        });

        const res = await request(app)
            .delete('/api/felhasznalok/profile');

        expect(res.status).toBe(200);
        expect(res.body.uzenet).toBe("Felhasználó sikeresen törölve");
        expect(res.body.torolt_tarsasagok).toBe(0);
        expect(res.body.torolt_tagsagok).toBe(3);
    });

    it('200-as státuszkódot kell kapni újradelve felhasználónál', async () => {
        const testApp = express();
        testApp.use(express.json());
        testApp.use((req, res, next) => {
            req.user = { id: 9 }; 
            next();
        });
        testApp.delete('/api/felhasznalok/profile', userController.deleteUser);

        userModel.deleteUserUser = jest.fn((userId, callback) => {
            callback(null, {
                affectedRows: 0,
                deletedCompanies: 0,
                deletedMemberships: 0
            });
        });

        const res = await request(testApp)
            .delete('/api/felhasznalok/profile');

        expect(res.status).toBe(200);
        expect(res.body.torolt_tarsasagok).toBe(0);
        expect(res.body.torolt_tagsagok).toBe(0);
    });
});
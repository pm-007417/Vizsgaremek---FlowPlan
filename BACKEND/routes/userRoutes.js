const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const {registerValidator, loginValidator,
    updateProfileValidator, updatePasswordValidator, getUserByEmailValidator} = require("../validators/userValidators");
const authMiddleware = require('../middlewares/auth');

//Alap regisztráció
router.post('/register', registerValidator, userController.postNewUser);

//Bejelentkezés
router.post('/login', loginValidator, userController.postLoginUser);

//TOKEN FRISSÍTÉS
router.post('/refresh', userController.refreshToken);

// Felahsználó társaságai és szerepkörei
router.get('/tarsasagok', authMiddleware.verifyToken, userController.getUserAllComp)

//Profil megtekintése
router.get('/profile',  authMiddleware.verifyToken, userController.getUserProfile);

// Profil adatok módosítása
router.put('/profile', authMiddleware.verifyToken, updateProfileValidator, userController.updateProfile);

// Jelszó módosítása
router.put('/password', authMiddleware.verifyToken, updatePasswordValidator, userController.updatePassword);

// Felhasználó törlése
router.delete('/profile', authMiddleware.verifyToken, userController.deleteUser);

// Felhasználó lekérdezése email alapján
router.get('/:email', getUserByEmailValidator, userController.getUserByEmail)

module.exports = router;
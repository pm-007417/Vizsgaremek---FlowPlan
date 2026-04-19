const {body, param} = require('express-validator')
const {validateRequest} = require("../utils/validationHelper")

//Regisztráció

const registerValidator = [
    body('nev').isString().trim().notEmpty().isLength({min: 3, max: 60}).withMessage('Név megadása kötelező, 3-60 karakter hosszú lehet!'),

    body('email').isEmail().normalizeEmail().notEmpty().withMessage("Érvényes email cím megadása kötelező!"),

    body('jelszo').isString().notEmpty().isLength({min: 8}).withMessage("A jelszónak legalább 8 karakter hosszúnak kell lennie!"),

    validateRequest
]

//Bejelentkezés
const loginValidator = [
    body('email').isEmail().normalizeEmail().notEmpty().withMessage("Érvényes email cím megadása kötelező!"),

    body('jelszo').isString().notEmpty().withMessage("A jelszó megadása kötelező!"),

    validateRequest
]

//Profil módosítása
const updateProfileValidator = [
    body('nev').isString().trim().notEmpty().isLength({min: 3, max: 60}).withMessage('Új név megadása kötelező, 3-60 karakter hosszú lehet!'),

    body('email').isEmail().normalizeEmail().notEmpty().withMessage("Új érvényes email cím megadása kötelező!"),

    validateRequest
]

//Jelszó módosítása
const updatePasswordValidator = [
    body('regiJelszo').isString().notEmpty().isLength({min: 8}).withMessage("A régi jelszónak legalább 8 karakter hosszúnak kell lennie!"),
    
    body('ujJelszo').isString().notEmpty().isLength({min: 8}).withMessage("Az új jelszónak legalább 8 karakter hosszúnak kell lennie!"),

    validateRequest
]

//Email alapú keresés
const getUserByEmailValidator = [
    param('email').isEmail().notEmpty().withMessage("Érvényes email cím megadása kötelező!"),

    validateRequest
]

module.exports = {
    registerValidator,
    loginValidator,
    updateProfileValidator,
    updatePasswordValidator,
    getUserByEmailValidator
}
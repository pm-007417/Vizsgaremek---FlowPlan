const {body, param} = require('express-validator')
const {validateRequest} = require("../utils/validationHelper")

//Társaság létrehozása
const createCompanyValidator = [
    body('nev').isString().trim().notEmpty().withMessage('Név megadása kötelező, szövegnek kell lennie'),

    validateRequest
]

//Társaság név módosítása
const updateCompanyNameValidator = [
    param('id').isInt({min: 1}).withMessage('A társaság ID-nek pozitív egész számnak kell lennie'),

    body('nev').isString().trim().notEmpty().withMessage('Név megadása kötelező, szövegnek kell lennie'),

    validateRequest
]

//Társaság törlése
const deleteCompanyHardValidator =[
    param('id').isInt({min: 1}).withMessage('A társaság ID-nek pozitív egész számnak kell lennie'),

    validateRequest
]

//Tag hozzáadása
const addMemberValidator =[
    param('id').isInt({min: 1}).withMessage('A társaság ID-nek pozitív egész számnak kell lennie'),

    body('email').isEmail().notEmpty().normalizeEmail().withMessage('Érvényes email cím megadása kötelező'),

    body('szerepkor').isIn(['admin','manager','tag']).withMessage('A szerepkör csak admin, manager vagy tag lehet'),

    validateRequest
]

//Szerepkör módosítás
const updateMemberRoleValidator =[
    param('id').isInt({min: 1}).withMessage('A társaság ID-nek pozitív egész számnak kell lennie'),

    param('felhasznaloId').isInt({min: 1}).withMessage('A felhasználó ID-nek pozitív egész számnak kell lennie'),

    body('szerepkor').isIn(['admin','manager','tag']).withMessage('A szerepkör csak admin, manager vagy tag lehet'),

    validateRequest
]

//Tagok listázása
const getAllMembersOfCompanyValidator =[
    param('tarsasag_id').isInt({min: 1}).withMessage('A társaság ID-nek pozitív egész számnak kell lennie'),

    validateRequest
]

//Tag deaktiválása
const deactivateMemberValidator =[
    param('tarsasag_id').isInt({ min: 1 }).withMessage('A társaság ID-nek pozitív egész számnak kell lennie'),

    param('felhasznaloId').isInt({ min: 1 }).withMessage('A felhasználó ID-nek pozitív egész számnak kell lennie'),

    validateRequest
]

//Tag aktiválása
const activateMemberValidator =[
    param('tarsasag_id').isInt({ min: 1 }).withMessage('A társaság ID-nek pozitív egész számnak kell lennie'),

    param('felhasznaloId').isInt({ min: 1 }).withMessage('A felhasználó ID-nek pozitív egész számnak kell lennie'),
    
    validateRequest
]

const companyStatusValidator = [
    param('tarsasag_id').isInt({ min: 1 }).withMessage('A társaság ID pozitív egész szám kell legyen'),

    validateRequest
]

//Alapító módosítása
const changeFounderValidator =[
    param('tarsasag_id').isInt({ min: 1 }).withMessage('A társaság ID-nek pozitív egész számnak kell lennie'),

    body('uj_alapito_id').isInt({min: 1}).withMessage('Az új alapító ID-nek pozitív egész számnak kell lennie')
    .custom((value,{req})=>{
        if (value === req.user.id) {
            throw new Error('Az új alapító nem lehet ugyanaz, mint a jelenlegi')
        }
        return true
    }),

    validateRequest
]

module.exports = {
    createCompanyValidator,
    updateCompanyNameValidator,
    deleteCompanyHardValidator,
    addMemberValidator,
    updateMemberRoleValidator,
    getAllMembersOfCompanyValidator,
    deactivateMemberValidator,
    activateMemberValidator,
    companyStatusValidator,
    changeFounderValidator

}


const { param, body } = require("express-validator");
const { validateRequest } = require("../utils/validationHelper");

const projectPostNewProjectValidator = [
    param('tarsasag_id').isInt({ min: 1 }).withMessage('A társaság ID-nak pozitív egész számnak kell lennie!'),

    body('cim').isString().trim().notEmpty().withMessage('A címnek szövegnek kell lennie és kötelezően megadandó!'),

    body('hatarido').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('A dátumnak a következő formátumban kell lennie: ÉÉÉÉ-HH-NN!'),

    validateRequest
];

const projectPostNewUserToProjectValidator = [
    param('projekt_id').isInt({ min: 1 }).withMessage('A projekt ID-nak pozitív egész számnak kell lennie!'),

    body('felhasznalo_id').isInt({ min: 1 }).withMessage('A felhasználó ID-nak pozitív egész számnak kell lennie!'),

    validateRequest
];

const projectPostNewMessageValidator = [
    param('projekt_id').isInt({ min: 1 }).withMessage('A projekt ID-nak pozitív egész számnak kell lennie!'),

    body('tartalom').isString().trim().notEmpty().withMessage('A tartalomnak szövegnek kell lennie!'),

    validateRequest
];

const projectPutValidator = [
    param('projekt_id').isInt({ min: 1 }).withMessage('A projekt ID-nak pozitív egész számnak kell lennie!'),

    body('cim').isString().trim().notEmpty().withMessage('A címnek szövegnek kell lennie!'),

    body('leiras').isString().trim().notEmpty().withMessage('A leírásnak szövegnek kell lennie!'),

    body('hatarido').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('A dátumnak a következő formátumban kell lennie: ÉÉÉÉ-HH-NN!'),

    body('allapot').isString().trim().notEmpty().withMessage('Az állapotnak szövegnek kell lennie!'),

    validateRequest
];

const projectDeleteValidator = [
    param('projekt_id').isInt({ min: 1 }).withMessage('A projekt ID-nak pozitív egész számnak kell lennie!'),

    validateRequest
];

const projectDeleteRemoveUserValidator = [
    param('projekt_id').isInt({ min: 1 }).withMessage('A projekt ID-nak pozitív egész számnak kell lennie!'),

    body('torlendo_felhasznalo_id').isInt({ min: 1 }).withMessage('A felhasználó ID-nak pozitív egész számnak kell lennie!'),

    validateRequest
];

module.exports = {
    projectPostNewProjectValidator,
    projectPostNewUserToProjectValidator,
    projectPostNewMessageValidator,
    projectPutValidator,
    projectDeleteValidator,
    projectDeleteRemoveUserValidator
}
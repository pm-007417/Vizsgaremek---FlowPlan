const { param, body } = require("express-validator");
const { validateRequest } = require("../utils/validationHelper");

const taskPostNewTaskValidator = [
    param('projekt_id').isInt({ min: 1 }).withMessage('A projekt ID-nak pozitív egész számnak kell lennie!'),

    body('cim').isString().trim().notEmpty().withMessage('A címnek szövegnek kell lennie és kötelezően megadandó!'),

    body('leiras').optional({ nullable: true, checkFalsy: true }).isString().withMessage('A leírásnak szövegnek kell lennie!'),

    body('hatarido').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('A dátumnak a következő formátumban kell lennie: ÉÉÉÉ-HH-NN!'),

    body('tarsasag_id').isInt({ min: 1 }).withMessage('A társaság ID-nak pozitív egész számnak kell lennie és kötelező megadni!'),

    validateRequest
];

const taskPostNewUserToTaskValidator = [
    param('feladat_id').isInt({ min: 1 }).withMessage('A feladat ID-nak pozitív egész számnak kell lennie!'),

    body('felhasznalo_id').isInt({ min: 1 }).withMessage('A felhasználó ID-nak pozitív egész számnak kell lennie!'),

    validateRequest
];

const taskPostNewMessageValidator = [
    param('feladat_id').isInt({ min: 1 }).withMessage('A feladat ID-nak pozitív egész számnak kell lennie!'),

    body('tartalom').isString().trim().notEmpty().withMessage('A tartalomnak szövegnek kell lennie!'),

    validateRequest
];

const taskPutValidator = [
    param('feladat_id').isInt({ min: 1 }).withMessage('A feladat ID-nak pozitív egész számnak kell lennie!'),

    body('cim').isString().trim().notEmpty().withMessage('A címnek szövegnek kell lennie!'),

    body('leiras').optional({ nullable: true, checkFalsy: true }).isString().withMessage('A leírásnak szövegnek kell lennie!'),


    body('hatarido').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('A dátumnak a következő formátumban kell lennie: ÉÉÉÉ-HH-NN!'),

    body('allapot').isString().trim().notEmpty().withMessage('Az állapotnak szövegnek kell lennie!'),

    validateRequest
];

const taskDeleteValidator = [
    param('feladat_id').isInt({ min: 1 }).withMessage('A feladat ID-nak pozitív egész számnak kell lennie!'),

    validateRequest
];

const taskDeleteRemoveUserValidator = [
    param('feladat_id').isInt({ min: 1 }).withMessage('A feladat ID-nak pozitív egész számnak kell lennie!'),

    body('torlendo_felhasznalo_id').isInt({ min: 1 }).withMessage('A felhasználó ID-nak pozitív egész számnak kell lennie!'),

    validateRequest
];

module.exports = {
    taskPostNewTaskValidator,
    taskPostNewUserToTaskValidator,
    taskPostNewMessageValidator,
    taskPutValidator,
    taskDeleteValidator,
    taskDeleteRemoveUserValidator
}
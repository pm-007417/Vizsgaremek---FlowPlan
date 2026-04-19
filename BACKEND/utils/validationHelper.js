const { validationResult } = require("express-validator");

// A validációs hibaellenőrző segédfüggvény
const validateRequest = (keres, valasz, next) => {
    const errors = validationResult(keres);

    // Ha van validációs hiba
    if (!errors.isEmpty()) {
        return valasz.status(400).json({
            "valasz": "Validációs hiba!",
            "hibak": errors.array().map(err => (
                { "mezo": err.path, "uzenet": err.msg }
            ))
        });
    }

    // Ha nincs hiba, továbbengedjük a kérést
    next();
};

module.exports = {
    validateRequest
};
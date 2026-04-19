const jwt = require("jsonwebtoken");
const taskModel = require("../models/taskModel");
const projectModel = require("../models/projectModel");
const companyModel = require("../models/companyModel");

const authMiddleware = {
    verifyToken: (req, res, next) => {
        const header = req.headers.authorization;

        if (!header) {
            return res.status(401).json({ uzenet: "Nem található token, helyezze be az 'Authorize'-ba ami az oldal tetején található" });
        }

        const token = header.split(" ")[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ uzenet: "Érvénytelen token" });
            }

            req.user = decoded;
            next();
        });
    },

    //szerepkör ellenőrzés
    /**
     * 
     * @param {string []} elvartSzerepkorok 
     */
    requireTaskRole: (elvartSzerepkorok) => {
        return (req, res, next) => {
            try {
                const felhasznaloId = req.user.id;
                const feladatId = req.params.feladat_id;

                taskModel.selectTaskUserRole(feladatId, felhasznaloId, (err, data) => {
                    if (err) return next(err);

                    //egy társasághoz tartoznak-e
                    if (data.length === 0) {
                        return res.status(403).json({ uzenet: 'A felhasználó és a feladat nem egy társasághoz tartozik.' })
                    }

                    //szerepkör elmentése
                    const felhasznaloSzerepkor = data[0].szerepkor;


                    if (!elvartSzerepkorok.includes(felhasznaloSzerepkor)) {
                        return res.status(403).json({ uzenet: "Nincs jogosultságod ehhez a művelethez!" })
                    }
                    next();
                })
            } catch (err) {
                return next(err);
            }
        }
    },

    requireProjectRole: (elvartSzerepkorok) => {
        return (req, res, next) => {
            try {
                const felhasznaloId = req.user.id;
                const projektId = req.params.projekt_id;

                projectModel.selectProjectUserRole(projektId, felhasznaloId, (err, data) => {
                    if (err) return next(err);

                    //egy társasághoz tartoznak-e
                    if (data.length === 0) {
                        return res.status(403).json({ uzenet: 'A felhasználó és a projekt nem egy társasághoz tartozik.' })
                    }
                    //szerepkör ellenőrzése
                    if (!elvartSzerepkorok.includes(data[0].szerepkor)) {
                        return res.status(403).json({ uzenet: "Nincs jogosultságod ehhez a művelethez!" })
                    }
                    next();
                })
            } catch (err) {
                return next(err);
            }
        }
    },

    requireCompanyRole: (elvartSzerepkorok) => {
        return (req, res, next) => {
            try {
                const felhasznaloId = req.user.id;
                const tarsasgId = req.params.tarsasag_id;

                companyModel.getUserRoleInCompany(tarsasgId, felhasznaloId, (err, data) => {
                    if (err) return next(err);

                    //egy társasághoz tartoznak-e
                    if (data.length === 0) {
                        return res.status(403).json({ uzenet: 'A felhasználó és a projekt nem egy társasághoz tartozik.' })
                    }
                    //szerepkör ellenőrzése
                    if (!elvartSzerepkorok.includes(data[0].szerepkor)) {
                        return res.status(403).json({ uzenet: "Nincs jogosultságod ehhez a művelethez!" })
                    }
                    next();
                })
            } catch (err) {
                return next(err);
            }
        }
    }
}

module.exports = authMiddleware;
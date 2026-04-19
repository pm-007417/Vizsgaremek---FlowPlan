const userModel = require('../models/userModel');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * @swagger
 * tags:
 *   name: Felhasználók
 *   description: Felhasználók kezelése (regisztráció, bejelentkezés, profil)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Felhasznalo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Felhasználó azonosító
 *           example: 1
 *         nev:
 *           type: string
 *           description: Felhasználó neve
 *           example: "Teszt Elek"
 *         email:
 *           type: string
 *           format: email
 *           description: Email cím
 *           example: "teszt.elek@test.hu"
 *         letrehozas_datum:
 *           type: string
 *           format: date
 *           description: Regisztráció dátuma
 *           example: "2025-01-15"
 */


const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: '7d' } 
    );
};

const userController = {

    /**
     * @swagger
     * /api/felhasznalok/{email}:
     *   get:
     *     summary: Felhasználó lekérdezése email alapján
     *     description: Felhasználó adatainak lekérdezése email cím alapján
     *     tags: [Felhasználók]
     *     parameters:
     *       - in: path
     *         name: email
     *         required: true
     *         schema:
     *           type: string
     *           format: email
     *         description: Felhasználó email címe
     *         example: "teszt.elek@test.hu"
     *     responses:
     *       200:
     *         description: Felhasználó adatai
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Felhasznalo'
     *       404:
     *         description: Felhasználó nem található
     *       500:
     *         description: Szerver hiba
     */
    getUserByEmail: (req, res, next) => {
        const felhasznaloEmail = req.params.email;

        userModel.selectUserByEmail(felhasznaloEmail, (hiba, eredmeny) => {
            if (hiba) return next(hiba);

            res.status(200).json(eredmeny);
        });
    },

    /**
     * @swagger
     * /api/felhasznalok/tarsasagok:
     *   get:
     *     summary: Felhasználó összes társasága
     *     description: A bejelentkezett felhasználó összes társaságának listázása
     *     tags: [Felhasználók]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Társaságok listája
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   tarsasag_id:
     *                     type: integer
     *                     example: 1
     *                   tarsasag_nev:
     *                     type: string
     *                     example: "TechStartup Kft."
     *                   szerepkor:
     *                     type: string
     *                     enum: [admin, manager, tag]
     *                     example: "admin"
     *                   csatlakozas_datum:
     *                     type: string
     *                     format: date
     *                     example: "2024-06-01"
     *       401:
     *         description: Nincs bejelentkezve
     *       500:
     *         description: Szerver hiba
     */
    getUserAllComp: (req, res, next) => {
        const userId = req.user.id;

        userModel.selectUserAllComp(userId, (hiba, eredmeny) => {
            if (hiba) return next(hiba);

            res.status(200).json(eredmeny);
        });
    },

    /**
     * @swagger
     * /api/felhasznalok/register:
     *   post:
     *     summary: Felhasználó regisztráció
     *     description: Új felhasználó regisztrálása a rendszerbe
     *     tags: [Felhasználók]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - nev
     *               - email
     *               - jelszo
     *             properties:
     *               nev:
     *                 type: string
     *                 description: Felhasználó teljes neve
     *                 example: "Teszt Elek"
     *               email:
     *                 type: string
     *                 format: email
     *                 description: Email cím
     *                 example: "teszt.elek@test.hu"
     *               jelszo:
     *                 type: string
     *                 format: password
     *                 description: Jelszó
     *                 example: "jelszo123"
     *     responses:
     *       201:
     *         description: Sikeres regisztráció
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 uzenet:
     *                   type: string
     *                   example: "Sikeres regisztráció"
     *                 felhasznalo_id:
     *                   type: integer
     *                   example: 5
     *       400:
     *         description: Ezzel az email címmel már regisztráltak
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 valasz:
     *                   type: string
     *                   example: "Ezzel az email címmel már regisztráltak"
     *       500:
     *         description: Szerver hiba
     */
    postNewUser: async (req, res, next) => {
        try {
            const { nev, email, jelszo } = req.body;

            const hashedPassword = await bcrypt.hash(jelszo, 10);

            const newUser = [nev, email, hashedPassword];

            userModel.insertNewUser(newUser, (hiba, eredmeny) => {
                if (hiba) {
                    if (hiba.code === "ER_DUP_ENTRY") {
                        return res.status(400).json({
                            "valasz": "Ezzel az email címmel már regisztráltak"
                        });
                    }
                    return next(hiba);
                }

                res.status(201).json({
                    uzenet: "Sikeres regisztráció",
                    felhasznalo_id: eredmeny.insertId
                });
            });

        } catch (err) {
            next(err);
        }
    },

    /**
     * @swagger
     * /api/felhasznalok/login:
     *   post:
     *     summary: Felhasználó bejelentkezés
     *     description: Bejelentkezés email és jelszó alapján, JWT access és refresh token visszaadása
     *     tags: [Felhasználók]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - jelszo
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 description: Regisztrált email cím
     *                 example: "teszt.elek@test.hu"
     *               jelszo:
     *                 type: string
     *                 format: password
     *                 description: Jelszó
     *                 example: "123456789"
     *     responses:
     *       200:
     *         description: Sikeres bejelentkezés
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 uzenet:
     *                   type: string
     *                   example: "Sikeres bejelentkezés"
     *                 token:
     *                   type: string
     *                   description: JWT access token (15 percig érvényes)
     *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     *                 refreshToken:
     *                   type: string
     *                   description: JWT refresh token (7 napig érvényes)
     *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     *       401:
     *         description: Hibás email vagy jelszó
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 uzenet:
     *                   type: string
     *                   example: "Hibás email vagy jelszó"
     *       500:
     *         description: Szerver hiba
     */
    postLoginUser: async (req, res, next) => {
        try {
            const { email, jelszo } = req.body;

            userModel.loginUser(email, async (hiba, eredmeny) => {
                if (hiba) return next(hiba);

                if (eredmeny.length === 0) {
                    return res.status(401).json({
                        uzenet: "Hibás email vagy jelszó"
                    });
                }

                const user = eredmeny[0];

                const match = await bcrypt.compare(jelszo, user.jelszo);

                if (!match) {
                    return res.status(401).json({
                        uzenet: "Hibás email vagy jelszó"
                    });
                }

                
                const accessToken = generateAccessToken(user);
                const refreshToken = generateRefreshToken(user);

                res.status(200).json({
                    uzenet: "Sikeres bejelentkezés",
                    token: accessToken,
                    refreshToken: refreshToken
                });
            });

        } catch (err) {
            next(err);
        }
    },

    /**
     * @swagger
     * /api/felhasznalok/refresh:
     *   post:
     *     summary: Token frissítése
     *     description: Új access token generálása érvényes refresh token alapján
     *     tags: [Felhasználók]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - refreshToken
     *             properties:
     *               refreshToken:
     *                 type: string
     *                 description: Érvényes JWT refresh token
     *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     *     responses:
     *       200:
     *         description: Sikeres token frissítés
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 token:
     *                   type: string
     *                   description: Új JWT access token (15 percig érvényes)
     *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     *       401:
     *         description: Refresh token hiányzik
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 uzenet:
     *                   type: string
     *                   example: "Refresh token hiányzik"
     *       403:
     *         description: Érvénytelen refresh token
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 uzenet:
     *                   type: string
     *                   example: "Érvénytelen refresh token"
     *       500:
     *         description: Szerver hiba
     */
    refreshToken: async (req, res, next) => {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(401).json({
                    uzenet: "Refresh token hiányzik"
                });
            }

            
            jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
                (err, decoded) => {
                    if (err) {
                        return res.status(403).json({
                            uzenet: "Érvénytelen refresh token"
                        });
                    }

                    
                    const newAccessToken = generateAccessToken({
                        id: decoded.id,
                        email: decoded.email
                    });

                    res.status(200).json({
                        token: newAccessToken
                    });
                }
            );

        } catch (err) {
            next(err);
        }
    },

    /**
     * @swagger
     * /api/felhasznalok/profile:
     *   put:
     *     summary: Profil adatok módosítása
     *     description: A bejelentkezett felhasználó nevének és email címének módosítása
     *     tags: [Felhasználók]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - nev
     *               - email
     *             properties:
     *               nev:
     *                 type: string
     *                 description: Új név
     *                 example: "Teszt Elek"
     *               email:
     *                 type: string
     *                 format: email
     *                 description: Új email cím
     *                 example: "teszt.elek.uj@test.hu"
     *     responses:
     *       200:
     *         description: Profil sikeresen frissítve
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 uzenet:
     *                   type: string
     *                   example: "Profil sikeresen frissítve"
     *       400:
     *         description: Név és email kötelező
     *       401:
     *         description: Nincs bejelentkezve
     *       500:
     *         description: Szerver hiba
     */
    updateProfile: (req, res, next) => {
        const id = req.user.id;
        const { nev, email } = req.body;

        if (!nev || !email) {
            return res.status(400).json({
                uzenet: "Név és email cím kötelező"
            });
        }

        userModel.updateUserProfile(id, nev, email, (hiba) => {
            if (hiba) return next(hiba);

            res.status(200).json({
                uzenet: "Profil sikeresen frissítve"
            });
        });
    },

    /**
     * @swagger
     * /api/felhasznalok/password:
     *   put:
     *     summary: Jelszó módosítása
     *     description: A bejelentkezett felhasználó jelszavának módosítása
     *     tags: [Felhasználók]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - regiJelszo
     *               - ujJelszo
     *             properties:
     *               regiJelszo:
     *                 type: string
     *                 format: password
     *                 description: Jelenlegi jelszó
     *                 example: "regiJelszo123"
     *               ujJelszo:
     *                 type: string
     *                 format: password
     *                 description: Új jelszó (nem egyezhet a jelenlegivel)
     *                 example: "ujJelszo456"
     *     responses:
     *       200:
     *         description: Jelszó sikeresen módosítva
     *       400:
     *         description: Az új jelszó megegyezik a jelenlegivel vagy validációs hiba
     *       401:
     *         description: Helytelen jelenlegi jelszó
     *       404:
     *         description: Felhasználó nem található
     *       500:
     *         description: Szerver hiba
     */
    updatePassword: async (req, res, next) => {
        try {
            const id = req.user.id;
            const { regiJelszo, ujJelszo } = req.body;

            if (!regiJelszo || !ujJelszo) {
                return res.status(400).json({
                    uzenet: "Régi és új jelszó megadása kötelező"
                });
            }

            if (ujJelszo.length < 6) {
                return res.status(400).json({
                    uzenet: "Az új jelszónak legalább 6 karakter hosszúnak kell lennie"
                });
            }

            userModel.selectUserByEmail(req.user.email, async (hiba, eredmeny) => {
                if (hiba) return next(hiba);

                if (!eredmeny || eredmeny.length === 0) {
                    return res.status(404).json({
                        uzenet: "Felhasználó nem található"
                    });
                }

                const user = eredmeny[0];

                const jelszoHelyes = await bcrypt.compare(regiJelszo, user.jelszo);

                if (!jelszoHelyes) {
                    return res.status(401).json({
                        uzenet: "Helytelen a jelenlegi jelszó"
                    });
                }

                const ujJelszoMegegyezik = await bcrypt.compare(ujJelszo, user.jelszo);

                if (ujJelszoMegegyezik) {
                    return res.status(400).json({
                        uzenet: "Az új jelszó nem egyezhet meg a jelenlegivel"
                    });
                }

                const hashedPassword = await bcrypt.hash(ujJelszo, 10);

                userModel.updateUserPassword(id, hashedPassword, (hiba, eredmeny) => {
                    if (hiba) return next(hiba);

                    res.status(200).json({
                        uzenet: "Jelszó sikeresen módosítva"
                    });
                });
            });

        } catch (err) {
            next(err);
        }
    },

    /**
     * @swagger
     * /api/felhasznalok/profile:
     *   get:
     *     summary: Saját profil lekérdezése
     *     description: A bejelentkezett felhasználó profil adatainak lekérdezése
     *     tags: [Felhasználók]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Profil adatok
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: integer
     *                   example: 1
     *                 nev:
     *                   type: string
     *                   example: "Teszt Elek"
     *                 email:
     *                   type: string
     *                   format: email
     *                   example: "teszt.elek.uj@test.hu"
     *                 letrehozas_datum:
     *                   type: string
     *                   format: date
     *                   example: "2025-01-15"
     *       401:
     *         description: Nincs bejelentkezve
     *       404:
     *         description: Felhasználó nem található
     *       500:
     *         description: Szerver hiba
     */
    getUserProfile: (req, res, next) => {
        const userId = req.user.id;

        userModel.getUserProfile(userId, (hiba, eredmeny) => {
            if (hiba) return next(hiba);

            if (eredmeny.length === 0) {
                return res.status(404).json({
                    uzenet: "Felhasználó nem található"
                });
            }

            res.status(200).json(eredmeny[0]);
        });
    },

    /**
     * @swagger
     * /api/felhasznalok/profile:
     *   delete:
     *     summary: Felhasználó törlése
     *     description: A bejelentkezett felhasználó saját fiókjának törlése. Az alapító társaságai is törlődnek.
     *     tags: [Felhasználók]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Felhasználó sikeresen törölve (társaságokkal együtt)
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 uzenet:
     *                   type: string
     *                   example: "Felhasználó sikeresen törölve"
     *                 torolt_tarsasagok:
     *                   type: integer
     *                   example: 2
     *                 torolt_tagsagok:
     *                   type: integer
     *                   example: 5
     *       401:
     *         description: Nincs bejelentkezve
     *       500:
     *         description: Szerver hiba
     */
    deleteUser: (req, res, next) => {
        const id = req.user.id;

        userModel.deleteUserUser(id, (hiba, eredmeny) => {
            if (hiba) return next(hiba);

            res.status(200).json({
                uzenet: "Felhasználó sikeresen törölve",
                torolt_tarsasagok: eredmeny.deletedCompanies,
                torolt_tagsagok: eredmeny.deletedMemberships
            });
        });
    }

};

module.exports = userController;
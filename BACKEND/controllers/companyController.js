const companyModel = require('../models/companyModel');
const userModel = require('../models/userModel');


/**
 * @swagger
 * tags:
 *   name: Társaságok
 *   description: Társaságok kezelése (létrehozás, módosítás, törlés, tagok kezelése)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Tarsasag:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Társaság azonosító
 *           example: 1
 *         nev:
 *           type: string
 *           description: Társaság neve
 *           example: "TechStartup Kft."
 *         letrehozas_datum:
 *           type: string
 *           format: date
 *           description: Létrehozás dátuma
 *           example: "2024-06-01"
 *         alapito_id:
 *           type: integer
 *           description: Alapító felhasználó ID
 *           example: 1
 *         aktiv:
 *           type: integer
 *           description: Aktív státusz (0=inaktív, 1=aktív)
 *           enum: [0, 1]
 *           example: 1
 *     
 *     TarsasagTag:
 *       type: object
 *       properties:
 *         tarsasag_neve:
 *           type: string
 *           example: "TechStartup Kft."
 *         felhasznalo_id:
 *           type: integer
 *           example: 1
 *         felhasznalo_nev:
 *           type: string
 *           example: "Nagy Péter"
 *         email:
 *           type: string
 *           format: email
 *           example: "peter.nagy@example.com"
 *         szerepkor:
 *           type: string
 *           enum: [admin, manager, tag]
 *           example: "admin"
 *         csatlakozas_datum:
 *           type: string
 *           format: date
 *           example: "2024-06-01"
 *         aktiv:
 *           type: integer
 *           enum: [0, 1]
 *           example: 1
 *         alapito:
 *           type: string
 *           enum: [Igen, Nem]
 *           example: "Igen"
 *         regisztracio_datum:
 *           type: string
 *           format: date
 *           example: "2025-01-15"
 */

const companyController = {

    /**
     * @swagger
     * /api/tarsasagok/{tarsasag_id}/members:
     *   get:
     *     summary: Társaság összes tagjának listázása
     *     description: Csak a társaság tagjai férhetnek hozzá a taglistához
     *     tags: [Társaságok]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: tarsasag_id
     *         required: true
     *         schema:
     *           type: integer
     *         description: Társaság azonosító
     *         example: 1
     *     responses:
     *       200:
     *         description: Tagok listája
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/TarsasagTag'
     *       403:
     *         description: Nincs jogosultság vagy nem tagja a társaságnak.
     *       500:
     *         description: Szerver hiba
     */
    getAllMembers: (req, res, next) => {
        const tarsasag_id = req.params.tarsasag_id;
        const felhasznalo_id = req.user.id;

        companyModel.getUserRoleInCompany(tarsasag_id, felhasznalo_id, (err, result) => {
            if (err) return next(err);

            if (!result.length) {
                return res.status(403).json({
                    uzenet: "Nem tagja a társaságnak"
                });
            }

            companyModel.getAllMembersOfCompany(tarsasag_id, (err, result) => {
                if (err) return next(err);

                res.status(200).json({
                    members: result,
                    currentUserId: felhasznalo_id
                });
            });
        });
    },

    /**
     * @swagger
     * /api/tarsasagok/{tarsasag_id}/projektek:
     *   get:
     *     summary: Társaság projektjeinek listázása
     *     description: Egy adott társasághoz tartozó összes projekt lekérdezése
     *     tags: [Társaságok]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: tarsasag_id
     *         required: true
     *         schema:
     *           type: integer
     *         description: Társaság azonosító
     *     responses:
     *       200:
     *         description: Projektek listája
     *       403:
     *         description: Nincs jogosultság - nem tagja a társaságnak
     *       500:
     *         description: Szerver hiba
     */
    getCompanyProjects: (req, res, next) => {
        const tarsasagId = req.params.tarsasag_id;
        const felhasznaloId = req.user.id;

        companyModel.getUserRoleInCompany(tarsasagId, felhasznaloId, (err, data) => {
            if (err) return next(err);

            if (data.length === 0) {
                return res.status(403).json({
                    uzenet: "Nem tagja a társaságnak!"
                });
            }

            companyModel.selectCompanyProjects(tarsasagId, (err, data) => {
                if (err) return next(err);
                res.status(200).json(data);
            });
        });
    },

    /**
     * @swagger
     * /api/tarsasagok/company:
     *   post:
     *     summary: Új társaság létrehozása
     *     description: Új társaság létrehozása, a bejelentkezett felhasználó lesz az alapító és admin
     *     tags: [Társaságok]
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
     *             properties:
     *               nev:
     *                 type: string
     *                 description: Társaság neve
     *                 example: "TechStartup Kft."
     *     responses:
     *       201:
     *         description: Társaság sikeresen létrehozva
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 uzenet:
     *                   type: string
     *                   example: "Új társaság sikeresen létrehozva"
     *                 tarsasag_id:
     *                   type: integer
     *                   example: 6
     *       401:
     *         description: Nincs bejelentkezve
     *       500:
     *         description: Szerver hiba
     */
    postCreateCompany: (req, res, next) => {
        const { nev } = req.body;
        const alapito_id = req.user.id;

        const data = [nev, alapito_id];

        companyModel.createCompany(data, (hiba, eredmeny) => {
            if (hiba) {
                return next(hiba);
            }

            res.status(201).json({
                uzenet: "Új társaság sikeresen létrehozva",
                tarsasag_id: eredmeny.tarsasag_id
            });
        });
    },

    /**
     * @swagger
     * /api/tarsasagok/company/{id}:
     *   put:
     *     summary: Társaság nevének módosítása
     *     description: Csak admin módosíthatja a társaság nevét
     *     tags: [Társaságok]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: Társaság azonosító
     *         example: 1
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - nev
     *             properties:
     *               nev:
     *                 type: string
     *                 description: Új társasági név
     *                 example: "TechStartup Hungary Kft."
     *     responses:
     *       200:
     *         description: Név sikeresen módosítva
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 uzenet:
     *                   type: string
     *                   example: "Társaság neve sikeresen módosítva"
     *       403:
     *         description: Nincs jogosultsága
     *       500:
     *         description: Szerver hiba
     */
    putUpdateCompanyName: (req, res, next) => {
        const { nev } = req.body;
        const tarsasagId = req.params.id;
        const alapitoId = req.user.id;

        companyModel.getUserRoleInCompany(tarsasagId, alapitoId, (hiba, eredmeny) => {
            if (hiba) {
                return next(hiba);
            }

            if (eredmeny.length === 0) {
                return res.status(403).json({
                    uzenet: "Nem tagja a társaságnak"
                });
            }

            const szerepkor = eredmeny[0].szerepkor;

            if (!["admin"].includes(szerepkor)) {
                return res.status(403).json({
                    uzenet: "Nincs jogosultsága a név módosításához"
                });
            }

            const data = [nev, tarsasagId, alapitoId];

            companyModel.updateCompanyName(data, (hiba, eredmeny) => {
                if (hiba) {
                    return next(hiba);
                }

                if (eredmeny.affectedRows === 0) {
                    return res.status(403).json({
                        uzenet: "Nincs jogosultsága vagy nem létezik a társaság"
                    });
                }

                res.status(200).json({
                    uzenet: "Társaság neve sikeresen módosítva"
                });
            });
        });
    },

    /**
     * @swagger
     * /api/tarsasagok/{id}/torles:
     *   delete:
     *     summary: Társaság végleges törlése
     *     description: Csak az alapító törölheti véglegesen a társaságot
     *     tags: [Társaságok]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: Társaság azonosító
     *         example: 1
     *     responses:
     *       200:
     *         description: Társaság sikeresen törölve
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 uzenet:
     *                   type: string
     *                   example: "Társaság véglegesen törölve"
     *       403:
     *         description: Nincs jogosultsága vagy nem Ön az alapító
     *       500:
     *         description: Szerver hiba
     */
    deleteCompanyHard: (req, res, next) => {
        const tarsasag_id = req.params.id;
        const torlo_id = req.user.id;

        companyModel.getUserRoleInCompany(tarsasag_id, torlo_id, (hiba, eredmeny) => {
            if (hiba) return next(hiba);

            if (eredmeny.length === 0) {
                return res.status(403).json({
                    uzenet: "Nem tagja a társaságnak"
                });
            }

            const szerepkor = eredmeny[0].szerepkor;

            if (szerepkor !== "admin") {
                return res.status(403).json({
                    uzenet: "Csak az alapító törölheti a társaságot"
                });
            }

            const data = [tarsasag_id, torlo_id];

            companyModel.deleteCompanyHard(data, (hiba, eredmeny) => {
                if (hiba) return next(hiba);

                if (eredmeny.affectedRows === 0) {
                    return res.status(403).json({
                        uzenet: "Nem létezik a társaság vagy nem Ön az alapító"
                    });
                }

                res.status(200).json({
                    uzenet: "Társaság véglegesen törölve"
                });
            });
        });
    },

    /**
     * @swagger
     * /api/tarsasagok/{id}/tagok:
     *   post:
     *     summary: Új tag hozzáadása a társasághoz EMAIL alapján
     *     description: Csak admin adhat hozzá új tagot a társasághoz email cím alapján
     *     tags: [Társaságok]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: Társaság azonosító
     *         example: 1
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - szerepkor
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 description: Hozzáadandó felhasználó email címe
     *                 example: "anna.kovacs@techstartup.hu"
     *               szerepkor:
     *                 type: string
     *                 enum: [admin, manager, tag]
     *                 description: Szerepkör a társaságban
     *                 example: "tag"
     *     responses:
     *       201:
     *         description: Tag sikeresen hozzáadva
     *       400:
     *         description: Hibás adatok vagy érvénytelen szerepkör
     *       403:
     *         description: Nincs jogosultsága
     *       404:
     *         description: Felhasználó nem található
     *       409:
     *         description: A felhasználó már tagja a társaságnak
     *       500:
     *         description: Szerver hiba
     */
    addMemberToCompany: (req, res, next) => {
        const tarsasag_id = req.params.id;
        const { email, szerepkor } = req.body;
        const modosito_id = req.user.id;

        if (!email || !szerepkor) {
            return res.status(400).json({
                uzenet: "Email és szerepkör megadása kötelező"
            });
        }

        if (!['admin', 'manager', 'tag'].includes(szerepkor)) {
            return res.status(400).json({
                uzenet: "Érvénytelen szerepkör"
            });
        }

        companyModel.getUserRoleInCompany(tarsasag_id, modosito_id, (err, result) => {
            if (err) return next(err);

            if (!result.length || result[0].szerepkor !== 'admin') {
                return res.status(403).json({
                    uzenet: "Csak adminisztrátorok adhatnak hozzá tagokat"
                });
            }

            userModel.selectUserByEmail(email, (err, userResult) => {
                if (err) return next(err);

                if (!userResult || userResult.length === 0) {
                    return res.status(404).json({
                        uzenet: "A megadott email címmel nem található felhasználó"
                    });
                }

                const felhasznalo_id = userResult[0].id;

                companyModel.getUserRoleInCompany(tarsasag_id, felhasznalo_id, (err, membershipResult) => {
                    if (err) return next(err);

                    if (membershipResult && membershipResult.length > 0) {
                        return res.status(409).json({
                            uzenet: "Ez a felhasználó már tagja a társaságnak"
                        });
                    }

                    const data = {
                        tarsasag_id,
                        uj_felhasznalo_id: felhasznalo_id,
                        szerepkor,
                        modosito_id
                    };

                    companyModel.insertMember(data, (hiba, eredmeny) => {
                        if (hiba) return next(hiba);

                        if (eredmeny.affectedRows === 0) {
                            return res.status(403).json({
                                uzenet: "Nincs jogosultsága vagy már tag a felhasználó"
                            });
                        }

                        res.status(201).json({
                            uzenet: "Tag sikeresen hozzáadva"
                        });
                    });
                });
            });
        });
    },

    /**
     * @swagger
     * /api/tarsasagok/{id}/tagok/{felhasznaloId}:
     *   put:
     *     summary: Tag szerepkörének módosítása
     *     description: Admin vagy manager módosíthatja a tagok szerepkörét
     *     tags: [Társaságok]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: Társaság azonosító
     *         example: 1
     *       - in: path
     *         name: felhasznaloId
     *         required: true
     *         schema:
     *           type: integer
     *         description: Felhasználó azonosító
     *         example: 5
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - szerepkor
     *             properties:
     *               szerepkor:
     *                 type: string
     *                 enum: [admin, manager, tag]
     *                 description: Új szerepkör
     *                 example: "manager"
     *     responses:
     *       200:
     *         description: Szerepkör sikeresen frissítve
     *       400:
     *         description: Érvénytelen szerepkör
     *       403:
     *         description: Nincs jogosultsága
     *       404:
     *         description: Felhasználó nem található a társaságban
     *       500:
     *         description: Szerver hiba
     */
    updateMemberRole: (req, res, next) => {
        const tarsasag_id = req.params.id;
        const celFelhasznaloId = req.params.felhasznaloId;
        const { szerepkor } = req.body;
        const modosito_id = req.user.id;

        if (!["admin", "manager", "tag"].includes(szerepkor)) {
            return res.status(400).json({
                uzenet: "Érvénytelen szerepkör"
            });
        }

        if (parseInt(celFelhasznaloId) === modosito_id) {
            return res.status(400).json({
                uzenet: "Nem módosíthatja saját szerepkörét! Módosításához kérjük, forduljon adminisztrátorhoz/alapítóhoz!."
            });
        }

        companyModel.getUserRoleInCompany(tarsasag_id, modosito_id, (err, result) => {
            if (err) return next(err);

            if (result.length === 0) {
                return res.status(403).json({
                    uzenet: "Nem tagja a társaságnak"
                });
            }

            const userRole = result[0].szerepkor;

            if (!["admin", "manager"].includes(userRole)) {
                return res.status(403).json({
                    uzenet: "Nincs jogosultsága szerepkör módosítására"
                });
            }

            companyModel.getUserRoleInCompany(tarsasag_id, celFelhasznaloId, (err, targetResult) => {
                if (err) return next(err);

                if (targetResult.length === 0) {
                    return res.status(404).json({
                        uzenet: "Felhasználó nem található a társaságban"
                    });
                }

                const targetRole = targetResult[0].szerepkor;

                if (userRole === "manager") {
                    if (targetRole !== "tag") {
                        return res.status(403).json({
                            uzenet: "Manager csak tag szerepkörű felhasználókat módosíthat"
                        });
                    }

                    if (szerepkor === "admin") {
                        return res.status(403).json({
                            uzenet: "Manager nem adhat admin jogosultságot"
                        });
                    }
                }

                companyModel.updateMemberRole(tarsasag_id, celFelhasznaloId, szerepkor, (err, result) => {
                    if (err) return next(err);

                    if (result.affectedRows === 0) {
                        return res.status(404).json({
                            uzenet: "Felhasználó nem található a társaságban"
                        });
                    }

                    res.json({
                        uzenet: "Szerepkör frissítve"
                    });
                });
            });
        });
    },

    /**
     * @swagger
     * /api/tarsasagok/{tarsasag_id}/deaktival:
     *   put:
     *     summary: Társaság deaktiválása
     *     description: Csak az alapító deaktiválhatja a társaságot
     *     tags: [Társaságok]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: tarsasag_id
     *         required: true
     *         schema:
     *           type: integer
     *         description: Társaság azonosító
     *         example: 1
     *     responses:
     *       200:
     *         description: Társaság sikeresen deaktiválva
     *       403:
     *         description: Nincs jogosultsága vagy már deaktivált a társaság
     *       500:
     *         description: Szerver hiba
     */
    deactivateCompany: (req, res, next) => {
        const tarsasag_id = req.params.tarsasag_id;
        const felhasznalo_id = req.user.id;

        companyModel.getUserRoleInCompany(tarsasag_id, felhasznalo_id, (hiba, eredmeny) => {
            if (hiba) return next(hiba);

            if (eredmeny.length === 0) {
                return res.status(403).json({
                    uzenet: "Nem tagja a társaságnak"
                });
            }

            const szerepkor = eredmeny[0].szerepkor;

            if (szerepkor !== "admin") {
                return res.status(403).json({
                    uzenet: "Csak admin deaktiválhatja a társaságot"
                });
            }

            companyModel.deactivateCompany(tarsasag_id, felhasznalo_id, (err, result) => {
                if (err) return next(err);

                if (result.affectedRows === 0) {
                    return res.status(403).json({
                        uzenet: "Csak az alapító deaktiválhatja a társaságot vagy már deaktiválva van"
                    });
                }

                res.json({
                    uzenet: "Társaság sikeresen deaktiválva"
                });
            });
        });
    },

    /**
     * @swagger
     * /api/tarsasagok/{tarsasag_id}/aktival:
     *   put:
     *     summary: Társaság újraaktiválása
     *     description: Csak az alapító aktiválhatja újra a társaságot
     *     tags: [Társaságok]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: tarsasag_id
     *         required: true
     *         schema:
     *           type: integer
     *         description: Társaság azonosító
     *         example: 1
     *     responses:
     *       200:
     *         description: Társaság sikeresen aktiválva
     *       403:
     *         description: Nincs jogosultsága vagy már aktív a társaság
     *       500:
     *         description: Szerver hiba
     */
    activateCompany: (req, res, next) => {
        const tarsasag_id = req.params.tarsasag_id;
        const felhasznalo_id = req.user.id;

        companyModel.getUserRoleInCompany(tarsasag_id, felhasznalo_id, (hiba, eredmeny) => {
            if (hiba) return next(hiba);

            if (eredmeny.length === 0) {
                return res.status(403).json({
                    uzenet: "Nem tagja a társaságnak"
                });
            }

            const szerepkor = eredmeny[0].szerepkor;

            if (szerepkor !== "admin") {
                return res.status(403).json({
                    uzenet: "Csak admin aktiválhatja a társaságot"
                });
            }

            companyModel.activateCompany(tarsasag_id, felhasznalo_id, (err, result) => {
                if (err) return next(err);

                if (result.affectedRows === 0) {
                    return res.status(403).json({
                        uzenet: "Csak az alapító aktiválhatja újra a társaságot vagy már aktiválva van"
                    });
                }

                res.json({
                    uzenet: "Társaság sikeresen aktiválva"
                });
            });
        });
    },

    /**
     * @swagger
     * /api/tarsasagok/{tarsasag_id}/member/{felhasznaloId}/deactivate:
     *   put:
     *     summary: Tag deaktiválása
     *     description: Admin deaktiválhat bárkit, manager csak tag szerepkörű felhasználót
     *     tags: [Társaságok]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: tarsasag_id
     *         required: true
     *         schema:
     *           type: integer
     *         description: Társaság azonosító
     *         example: 1
     *       - in: path
     *         name: felhasznaloId
     *         required: true
     *         schema:
     *           type: integer
     *         description: Felhasználó azonosító
     *         example: 5
     *     responses:
     *       200:
     *         description: Felhasználó sikeresen deaktiválva
     *       400:
     *         description: Saját magát próbálja deaktiválni
     *       403:
     *         description: Nincs jogosultsága vagy manager próbál admin/manager-t deaktiválni
     *       404:
     *         description: Felhasználó nem található a társaságban
     *       500:
     *         description: Szerver hiba
     */
    deactivateMember: (req, res, next) => {
        const tarsasag_id = req.params.tarsasag_id;
        const felhasznalo_id = req.params.felhasznaloId;
        const modosito_id = req.user.id;

        if (parseInt(felhasznalo_id) === modosito_id) {
            return res.status(400).json({
                uzenet: "Nem deaktiválhatja saját magát!"
            });
        }

        companyModel.getUserRoleInCompany(tarsasag_id, modosito_id, (err, result) => {
            if (err) return next(err);

            if (!result.length) {
                return res.status(403).json({
                    uzenet: "Nem tagja a társaságnak"
                });
            }

            const modositoSzerepkor = result[0].szerepkor;

            if (!["admin", "manager"].includes(modositoSzerepkor)) {
                return res.status(403).json({
                    uzenet: "Nincs jogosultsága tag deaktiválására"
                });
            }

            companyModel.getUserRoleInCompany(tarsasag_id, felhasznalo_id, (err, targetResult) => {
                if (err) return next(err);

                if (!targetResult.length) {
                    return res.status(404).json({
                        uzenet: "Felhasználó nem található a társaságban"
                    });
                }

                const targetSzerepkor = targetResult[0].szerepkor;

                if (modositoSzerepkor === "manager" && (targetSzerepkor === "admin" || targetSzerepkor === "manager")) {
                    return res.status(403).json({
                        uzenet: "Manager csak tag szerepkörű felhasználókat deaktiválhat"
                    });
                }

                companyModel.deactivateMember(felhasznalo_id, tarsasag_id, modosito_id, (err, result) => {
                    if (err) return next(err);

                    if (result.affectedRows === 0) {
                        return res.status(403).json({
                            uzenet: "Nincs jogosultsága vagy alapítót próbál deaktiválni"
                        });
                    }

                    res.json({
                        uzenet: "Felhasználó deaktiválva"
                    });
                });
            });
        });
    },

    /**
     * @swagger
     * /api/tarsasagok/{tarsasag_id}/member/{felhasznaloId}/activate:
     *   put:
     *     summary: Tag újraaktiválása
     *     description: Admin vagy manager aktiválhat újra tagot
     *     tags: [Társaságok]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: tarsasag_id
     *         required: true
     *         schema:
     *           type: integer
     *         description: Társaság azonosító
     *         example: 1
     *       - in: path
     *         name: felhasznaloId
     *         required: true
     *         schema:
     *           type: integer
     *         description: Felhasználó azonosító
     *         example: 5
     *     responses:
     *       200:
     *         description: Felhasználó sikeresen aktiválva
     *       403:
     *         description: Nincs jogosultsága vagy már aktív a felhasználó
     *       500:
     *         description: Szerver hiba
     */
    activateMember: (req, res, next) => {
        const tarsasag_id = req.params.tarsasag_id;
        const felhasznalo_id = req.params.felhasznaloId;
        const modosito_id = req.user.id;

        companyModel.getUserRoleInCompany(tarsasag_id, modosito_id, (err, result) => {
            if (err) return next(err);

            if (!result.length) {
                return res.status(403).json({
                    uzenet: "Nem tagja a társaságnak"
                });
            }

            const modositoSzerepkor = result[0].szerepkor;

            if (!["admin", "manager"].includes(modositoSzerepkor)) {
                return res.status(403).json({
                    uzenet: "Nincs jogosultsága tag aktiválására"
                });
            }

            companyModel.getUserRoleInCompanyWithInactive(tarsasag_id, felhasznalo_id, (err, targetResult) => {
                if (err) return next(err);

                if (!targetResult.length) {
                    return res.status(404).json({
                        uzenet: "Felhasználó nem található a társaságban"
                    });
                }

                const targetSzerepkor = targetResult[0].szerepkor;

                if (modositoSzerepkor === "manager" && (targetSzerepkor === "admin" || targetSzerepkor === "manager")) {
                    return res.status(403).json({
                        uzenet: "Manager csak tag szerepkörű felhasználókat aktiválhat"
                    });
                }

                companyModel.activateMember(tarsasag_id, felhasznalo_id, modosito_id, (err, result) => {
                    if (err) return next(err);

                    if (result.affectedRows === 0) {
                        return res.status(403).json({
                            uzenet: "Felhasználó nem található vagy már aktív"
                        });
                    }

                    res.json({
                        uzenet: "Felhasználó aktiválva"
                    });
                });
            });
        });
    },

    /**
     * @swagger
     * /api/tarsasagok/{tarsasag_id}/alapito:
     *   put:
     *     summary: Társaság alapítójának módosítása
     *     description: Csak a jelenlegi alapító adhatja át az alapítói jogokat másnak (VESZÉLYES MŰVELET - visszavonhatatlan!)
     *     tags: [Társaságok]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: tarsasag_id
     *         required: true
     *         schema:
     *           type: integer
     *         description: Társaság azonosító
     *         example: 1
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - uj_alapito_id
     *             properties:
     *               uj_alapito_id:
     *                 type: integer
     *                 description: Új alapító felhasználó ID (társasági tagnak kell lennie)
     *                 example: 2
     *     responses:
     *       200:
     *         description: Alapító sikeresen megváltoztatva
     *       403:
     *         description: Csak a jelenlegi alapító nevezhet ki új alapítót
     *       404:
     *         description: Társaság nem található
     *       500:
     *         description: Szerver hiba
     */
    changeFounder: (req, res, next) => {
        const tarsasag_id = req.params.tarsasag_id;
        const { uj_alapito_id } = req.body;
        const jelenlegi_alapito_id = req.user.id;

        companyModel.checkIsFounder(tarsasag_id, jelenlegi_alapito_id, (err, result) => {
            if (err) return next(err);

            if (!result.length) {
                return res.status(404).json({
                    uzenet: "Társaság nem található"
                });
            }

            const alapito_id = result[0].alapito_id;

            if (alapito_id !== jelenlegi_alapito_id) {
                return res.status(403).json({
                    uzenet: "Csak a jelenlegi alapító nevezhet ki új alapítót",
                    debug: {
                        alapito_id: alapito_id,
                        te_id: jelenlegi_alapito_id
                    }
                });
            }

            companyModel.changeFounderWithTransaction(
                tarsasag_id,
                uj_alapito_id,
                jelenlegi_alapito_id,
                (err, result) => {
                    if (err) {
                        if (err.statusCode === 403) {
                            return res.status(403).json({
                                uzenet: err.message
                            });
                        }
                        return next(err);
                    }

                    res.json({
                        uzenet: "Új alapító sikeresen kinevezve"
                    });
                }
            );
        });
    }
};

module.exports = companyController;
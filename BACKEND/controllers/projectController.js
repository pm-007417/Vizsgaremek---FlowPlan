const projectModel = require('../models/projectModel');

/**
 * @swagger
 * tags:
 *   name: Projektek
 *   description: Projektek kezelése
 */

const projectController = {
    //GET LOGIKA

    //projekt adatainak lekérése
    /**
     * @swagger
     * /api/projektek/{projekt_id}:
     *  get:
     *      summary: Projekt adatainak lekérdezése
     *      description: Ez a végpont lehetővé teszi egy projekt lekérdezését az adatbázisból, ami a bejelentkezett felhasználóhoz tartozik.
     *      tags: [Projektek]
     *      security:
     *          -   bearerAuth: []
     *      parameters:
     *          -   in: path
     *              name: projekt_id
     *              required: true
     *              type: number
     *      responses:
     *          200:
     *              description: Sikeres lekérdezés
     *              content:
     *                  application/json:
     *                      schema:
     *                          type: object
     *                          properties:
     *                              id:
     *                                  type: integer
     *                              cim:
     *                                  type: string
     *                              leiras:
     *                                  type: string
     *                              hatarido:
     *                                  type: string
     *                                  format: date
     *                              allapot:
     *                                  type: string
     *                                  enum: ['uj','folyamatban','felfuggesztve','kesz','torolve','archivalt']
     *                              letrehozas_datum:
     *                                  type: string
     *                                  format: date
     *                              tulajdonos_id:
     *                                  type: integer
     *                              tarsasag_id:
     *                                  type: integer
     *          400:
     *              description: Érvénytelen projekt azonosító
     *          401:
     *              description: Nincs bejelentkezve
     *          403:
     *              description: Nincs jogosultságod ehhez a projekthez
     *          404:
     *              description: A projekt nem található
     *          500:
     *              description: Szerverhiba
     */
    getProjectById: (req, res, next) => {
        const projektId = req.params.projekt_id;
        const felhasznaloId = req.user.id;

        if (isNaN(projektId)) {
            return res.status(400).json({ uzenet: "Érvénytelen projekt azonosító" });
        }

        projectModel.selectProjectById(projektId, (err, data) => {
            console.log("err:", err);
            console.log("data:", data);


            if (err) return next(err);
            if (data.length === 0) {
                return res.status(404).json({ uzenet: "A projekt nem található" });
            }

            projectModel.selectProjectByIdForUser(projektId, felhasznaloId, (err, data) => {
                if (err) return next(err);
                if (data.length === 0) {
                    return res.status(403).json({ uzenet: "Nincs jogosultságod ehhez a projekthez" });
                }
                res.status(200).json(data[0]);
            });
        });
    },

    //felhasználóhoz tartozó projektek lekérése
    /**
     * @swagger
     * /api/projektek/felhasznalo:
     *  get:
     *      summary: Összes, felhasználóhoz tartozó projekt lekérdezése létrehozás dátuma szerint rendezve
     *      description: Ez a végpont lehetővé teszi az összes projekt lekérdezését az adatbázisból, ami a bejelentkezett felhasználóhoz tartozik.
     *      tags: [Projektek]
     *      security:
     *          -   bearerAuth: []
     *      responses:
     *          200:
     *              description: Sikeres lekérdezés
     *              content:
     *                  application/json:
     *                      schema:
     *                          type: array
     *                          items:
     *                              type: object
     *                              properties:
     *                                  id:
     *                                      type: integer
     *                                  cim:
     *                                      type: string
     *                                  leiras:
     *                                      type: string
     *                                  hatarido:
     *                                      type: string
     *                                      format: date
     *                                  allapot:
     *                                      type: string
     *                                      enum: ['uj','folyamatban','felfuggesztve','kesz','torolve','archivalt']
     *                                  letrehozas_datum:
     *                                      type: string
     *                                      format: date
     *                                  tulajdonos_id:
     *                                      type: integer
     *                                  tarsasag_id:
     *                                      type: integer
     *          401:
     *              description: Nincs bejelentkezve
     *          403:
     *              description: Érvénytelen token
     *          500:
     *              description: Szerverhiba
     */
    getProjectsByUser: (req, res, next) => {
        const felhasznaloId = req.user.id;

        projectModel.selectProjectsByUser(felhasznaloId, (err, data) => {
            if (err) return next(err);
            res.status(200).json(data);
        })
    },

    //projekthez tartozó felhasználók lekérdezése
    /**
    * @swagger
    * /api/projektek/{projekt_id}/felhasznalok:
    *  get:
    *      summary: Projekt résztvevőinek lekérdezése
    *      description: Ez a végpont lehetővé teszi az összes résztvevő lekérdezését az adatbázisból, ami a az adott projekthez tartozik admin vagy manager szerepkörrel rendelkező tagnak.
    *      tags: [Projektek]
    *      security:
    *          -   bearerAuth: []
    *      parameters:
    *          -   in: path
    *              name: projekt_id
    *              required: true
    *              type: number
    *      responses:
    *          200:
    *              description: Sikeres lekérdezés
    *              content:
    *                  application/json:
    *                      schema:
    *                          type: array
    *                          items:
    *                              type: object
    *                              properties:
    *                                  projekt_id:
    *                                      type: integer
    *                                      descritption: Projekt azonosítója
    *                                  projekt_cim:
    *                                      type: string
    *                                      description: Projekt címe
    *                                  felhasznalo_id:
    *                                      type: integer
    *                                      description: Felhasználó azonosítója
    *                                  felhasznalo_neve:
    *                                      type: string
    *                                      description: Felhasználó neve
    *                                  felhasznalo_email:
    *                                      type: string
    *                                      format: email
    *                                      description: Felhasználó email címe
    *                                  hozzaadas_datuma:
    *                                      type: string
    *                                      format: date
    *                                      descrition: Felhasználó hozzáadásának dátuma
    *          400:
    *              description: Érvénytelen projekt azonosító
    *          401:
    *              description: Nincs bejelentkezve
    *          403:
    *              description: Nem résztvevője a projektnek, vagy nincs jogosultsága
    *          404:
    *              description: A megadott azonosítóvalnem található projekt
    *          500:
    *              description: Szerverhiba
    */
    getAllUsersByProject: (req, res, next) => {
        const projektId = req.params.projekt_id;
        const felhasznaloId = req.user.id;

        if (isNaN(projektId)) {
            return res.status(400).json({ uzenet: "Érvénytelen projekt azonosító" });
        }

        projectModel.selectProjectUserRole(projektId, felhasznaloId, (err, data) => {
            if (err) return next(err);

            if (data.length === 0) {
                return res.status(403).json({
                    uzenet: "Nem résztvevője a projektnek!"
                });
            }

            projectModel.selectAllUsersByProject(projektId, (err, data) => {
                if (err) return next(err);
                res.status(200).json(data);
            })
        })

    },

    //projekthez hozzá nem tartozó felhasználók lekérdezése egy társaságon belül
    /**
    * @swagger
    * /api/projektek/{projekt_id}/hozzaadhato_felhasznalok:
    *  get:
    *      summary: Projektben nem résztvevő felhasználók lekérdezése
    *      description: Ez a végpont lehetővé teszi az összes olyan résztvevő lekérdezését az adatbázisból, akik még nem résztvevői a projektnek, admin vagy manager szerepkörrel rendelkező tag kérheti.
    *      tags: [Projektek]
    *      security:
    *          -   bearerAuth: []
    *      parameters:
    *          -   in: path
    *              name: projekt_id
    *              required: true
    *              type: number
    *      responses:
    *          200:
    *              description: Sikeres lekérdezés
    *              content:
    *                  application/json:
    *                      schema:
    *                          type: array
    *                          items:
    *                              type: object
    *                              properties:
    *                                  felhasznalo_id:
    *                                      type: integer
    *                                      description: Felhasználó azonosítója
    *                                  felhasznalo_neve:
    *                                      type: string
    *                                      description: Felhasználó neve
    *                                  felhasznalo_email:
    *                                      type: string
    *                                      format: email
    *                                      description: Felhasználó email címe
    *          400:
    *              description: Érvénytelen projekt azonosító
    *          401:
    *              description: Nincs bejelentkezve
    *          404:
    *              description: A megadott azonosítóval nem található projekt
    *          500:
    *              description: Szerverhiba
    */
    getEligibleUsersForProject: (req, res, next) => {
        const projektId = req.params.projekt_id;

        if (isNaN(projektId)) {
            return res.status(400).json({ uzenet: "Érvénytelen projekt azonosító" });
        }

        projectModel.selectEligibleUsersForProject(projektId, (err, data) => {
            if (err) return next(err);
            res.status(200).json(data);
        });
    },

    // projekt feladatainak lekérdezése
    /**
     * @swagger
     * /api/projektek/{projekt_id}/feladatok:
     *  get:
     *      summary: Projekthez tartozó feladatok lekérdezése
     *      description: Ez a végpont lehetővé teszi az összes feladat lekérdezését az adatbázisból, ami a az adott projekthez tartozik.
     *      tags: [Projektek]
     *      security:
     *          -   bearerAuth: []
     *      parameters:
     *          -   in: path
     *              name: projekt_id
     *              required: true
     *              type: number
     *      responses:
     *          200:
     *              description: Sikeres lekérdezés
     *              content:
     *                  application/json:
     *                      schema:
     *                          type: array
     *                          items:
     *                              type: object
     *                              properties:
     *                                  id:
     *                                      type: integer
     *                                  cim:
     *                                      type: string
     *                                  leiras:
     *                                      type: string
     *                                  hatarido:
     *                                      type: string
     *                                      format: date
     *                                  allapot:
     *                                      type: string
     *                                      enum: ['uj','folyamatban','felfuggesztve','kesz','torolve','archivalt']
     *                                  letrehozas_datum:
     *                                      type: string
     *                                      format: date
     *                                  tulajdonos_id:
     *                                      type: integer
     *                                  tarsasag_id:
     *                                      type: integer
     *                                  projekt_id:
     *                                      type: integer
     *          400:
     *              description: Érvénytelen projekt azonosító
     *          401:
     *              description: Nincs bejelentkezve
     *          403:
     *              description: Nem résztvevője a projektnek!
     *          404:
     *              description: A projekt nem található 
     *          500:
     *              description: Szerverhiba
     */
    getProjectTasks: (req, res, next) => {
        const projektId = req.params.projekt_id;
        const felhasznaloId = req.user.id;

        if (isNaN(projektId)) {
            return res.status(400).json({ uzenet: "Érvénytelen projekt azonosító" });
        }

        projectModel.selectProjectUserRole(projektId, felhasznaloId, (err, data) => {
            if (err) return next(err);

            if (data.length === 0) {
                return res.status(403).json({
                    uzenet: "Nem résztvevője a projektnek!"
                });
            }

            projectModel.selectProjectTasks(projektId, (err, data) => {
                if (err) return next(err);
                res.status(200).json(data);
            })
        })
    },

    // projekt üzenet lekérdezése
    /**
     * @swagger
     * /api/projektek/{projekt_id}/uzenetek:
     *  get:
     *      summary: Projekthez tartozó üzenetek lekérdezése
     *      description: Ez a végpont lehetővé teszi az összes üzenet lekérdezését az adatbázisból, ami a az adott projekthez tartozik.
     *      tags: [Projektek]
     *      security:
     *          -   bearerAuth: []
     *      parameters:
     *          -   in: path
     *              name: projekt_id
     *              required: true
     *              type: number
     *      responses:
     *          200:
     *              description: Sikeres lekérdezés
     *              content:
     *                  application/json:
     *                      schema:
     *                          type: array
     *                          items:
     *                              type: object
     *                              properties:
     *                                  id:
     *                                      type: integer
     *                                  letrehozas_datum:
     *                                      type: string
     *                                      format: date
     *                                      description: Üzenet létrehozásának dátuma
     *                                  tartalom:
     *                                      type: string
     *                                      description: Üzenet szövege
     *                                  felhasznalo_id:
     *                                      type: integer
     *                                      descrition: küldő felhasználó azonosítója
     *                                  felhasznalo_nev:
     *                                      type: string
     *                                      description: Küldő felhasználó neve
     *                                  projekt_id:
     *                                      type: integer
     *                                      descrition: Projekt azonosítója
     *          400:
     *              description: Érvénytelen projekt azonosító
     *          401:
     *              description: Nincs bejelentkezve
     *          403:
     *              description: Nem résztvevője a projektnek!
     *          500:
     *              description: Szerverhiba
     */
    getAllProjectMessages: (req, res, next) => {
        const projektId = req.params.projekt_id;
        const felhasznaloId = req.user.id;

        if (isNaN(projektId)) {
            return res.status(400).json({ uzenet: "Érvénytelen projekt azonosító" });
        }

        projectModel.selectProjectUserRole(projektId, felhasznaloId, (err, data) => {
            if (err) return next(err);

            if (data.length === 0) {
                return res.status(403).json({
                    uzenet: "Nem résztvevője a projektnek!"
                });
            }

            projectModel.selectProjectMessages(projektId, (err, data) => {
                if (err) return next(err);
                res.status(200).json(data);
            })
        })
    },

    // POST LOGIKA
    // Projekt létrehozása
    /**
     * @swagger
     * /api/projektek/{tarsasag_id}/ujprojekt:
     *  post:
     *      summary: Új projekt létrehozása
     *      tags: [Projektek]
     *      security:
     *          -   bearerAuth: []
     *      parameters:
     *          -   in: path
     *              name: tarsasag_id
     *              required: true
     *              type: number
     *      requestBody:
     *          required: true
     *          content:
     *              application/json:
     *                  schema:
     *                      type: object
     *                      properties:
     *                          cim:
     *                              type: string
     *                              description: A projekt címe
     *                              example: Teszt projekt cím
     *                          leiras:
     *                              type: string
     *                              description: A projekt leírása
     *                              example: Teszt projekt leírása
     *                          hatarido:
     *                              type: string
     *                              format: date
     *                              description: A projekt határideje
     *      responses:
     *          201:
     *              description: Projekt sikeresen létrehozva
     *          400:
     *              description: Hibás kérés, validációs hiba!
     *          500:
     *              description: Hiba történt a projekt létrehozásakor
     */
    postNewProjekt: (req, res, next) => {
        const ujProjekt = req.body;
        const tulajdonosId = req.user.id;
        const tarsasagId = req.params.tarsasag_id;
        const hatarido = ujProjekt.hatarido || null;
        const newDatas = [ujProjekt.cim, ujProjekt.leiras, hatarido, tulajdonosId, tarsasagId, tulajdonosId];

        projectModel.insertNewProject(newDatas, (err, data) => {
            if (err) {
                return next(err);
            }
            res.status(201).json({
                uzenet: 'Projekt sikeresen létrehozva'
            })
        })
    },

    // felhasználó hozzáadása projekthez
    /**
     * @swagger
     * /api/projektek/{projekt_id}/felhasznalo_hozzaadas:
     *  post:
     *      summary: Felhasználó hozzáadása feldathoz
     *      tags: [Projektek]
     *      security:
     *          -   bearerAuth: []
     *      parameters:
     *          -   in: path
     *              name: projekt_id
     *              required: true
     *              type: number
     *      requestBody:
     *          required: true
     *          content:
     *              application/json:
     *                  schema:
     *                      type: object
     *                      properties:
     *                          felhasznalo_id:
     *                              type: integer
     *                              description: "A hozzáadni kívánt felhasználó azonosítója (id)"
     *                              example: 2
     *      responses:
     *          201:
     *              description: Felhasználó sikeresen hozzáadva a projekthez.
     *          400:
     *              description: A felhasználó már résztvevője ennek a projektnek.
     *          403:
     *              description: A felhasználó és a projekt nem egy társasághoz tartozik.
     *          500:
     *              description: Szerverhiba
     */
    postUserToProjekt: (req, res, next) => {
        const felhasznaloHozzaadId = req.body.felhasznalo_id;
        const projektId = req.params.projekt_id;
        const datas = [felhasznaloHozzaadId, projektId, felhasznaloHozzaadId, projektId];

        if (!felhasznaloHozzaadId || !projektId) {
            return res.status(400).json({
                uzenet: 'Hiányzó adatok'
            });
        }

        projectModel.insertUserToProject(datas, (err, data) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(406).json({
                        uzenet: 'A felhasználó már résztvevője ennek a projektnek.'
                    });
                }
                return next(err);
            }

            if (data.affectedRows === 0) {
                return res.status(403).json({
                    uzenet: 'A felhasználó és a projekt nem egy társasághoz tartozik.'
                });
            }

            res.status(201).json({
                uzenet: 'Felhasználó sikeresen hozzáadva a projekthez.',
            });
        })
    },

    // projekt üzenet létrehozása
    /**
     * @swagger
     * /api/projektek/{projekt_id}/ujuzenet:
     *  post:
     *      summary: Új üzenet létrehozása
     *      tags: [Projektek]
     *      security:
     *          -   bearerAuth: []
     *      parameters:
     *          -   in: path
     *              name: projekt_id
     *              required: true
     *              type: number
     *      requestBody:
     *          required: true
     *          content:
     *              application/json:
     *                  schema:
     *                      type: object
     *                      properties:
     *                          tartalom:
     *                              type: string
     *                              description: Az üzenet tartalma
     *                              example: Teszt üzenet 
     *      responses:
     *          201:
     *              description: Üzenet sikeresen létrehozva
     *          500:
     *              description: Hiba történt az üzenet létrehozásakor
     */
    postMessageToProject: (req, res, next) => {
        const uzenet = req.body;
        const projektId = req.params.projekt_id;
        const felhasznaloId = req.user.id;
        const newDatas = [projektId, felhasznaloId, uzenet.tartalom]

        projectModel.insertProjectMessage(newDatas, (err, data) => {
            if (err) {
                return next(err);
            }
            res.status(201).json({
                uzenet: 'Üzenet sikeresen hozzáadva'
            })
        })
    },

    // PUT LOGIKA
    // projekt módosítása
    /**
     * @swagger
     * /api/projektek/{projekt_id}/projekt_modositas:
     *  put:
     *      summary: Projekt módosítása
     *      tags: [Projektek]
     *      security:
     *          -   bearerAuth: []
     *      parameters:
     *          -   in: path
     *              name: projekt_id
     *              required: true
     *              type: number
     *      requestBody:
     *          required: true
     *          content:
     *              application/json:
     *                  schema:
     *                      type: object
     *                      properties:
     *                          cim:
     *                              type: string
     *                              description: A projekt címe
     *                              example: Teszt módosított projekt cím
     *                          leiras:
     *                              type: string
     *                              description: A projekt leírása
     *                              example: Teszt módosított projekt leírása
     *                          hatarido:
     *                              type: string
     *                              format: date
     *                              description: A projekt határideje
     *                          allapot:
     *                              type: string
     *                              enum: ['uj','folyamatban','felfuggesztve','kesz','torolve','archivalt']
     *                              description: "A projekt állapota: új/folyamatban/felfüggesztve/kész/törölve/archivált"
     *      responses:
     *          200:
     *              description: Projekt módosítva
     *          500:
     *              description: Hiba történt a projekt módosításakor
     */
    modifyProjekt: (req, res, next) => {
        const felhasznaloId = req.user.id;
        const modifiedDatas = [req.body.cim, req.body.leiras, req.body.hatarido, req.body.allapot, req.params.projekt_id, felhasznaloId];

        projectModel.updateProject(modifiedDatas, (err, data) => {
            if (err) {
                return next(err);
            }
            res.status(200).json({
                uzenet: 'Projekt módosítva.'
            })
        })
    },

    //DELETE LOGIKA
    //Projekt törlése
    /**
     * @swagger
     * /api/projektek/{projekt_id}/torles:
     *  delete:
     *      summary: Projekt törlése
     *      description: Ha a projekt állapota törölt, akkor véglegesn törlődik, egyéb esetben az állapota töröltre változik.
     *      tags: [Projektek]
     *      security:
     *          -   bearerAuth: []
     *      parameters:
     *          -   in: path
     *              name: projekt_id
     *              required: true
     *              type: number
     *      responses:
     *          200:
     *              description: A projekt a töröltek közé helyezve
     *          404:
     *              description: A projekt nem található
     *          500:
     *              description: Hiba történt a projekt törlésekor
     */
    deleteUserProject: (req, res, next) => {
        const felhasznaloId = req.user.id;
        const projektId = req.params.projekt_id;

        //projekt jelenlegi állapotának lekérdezése
        projectModel.selectProjectById(projektId, (err, data) => {
            if (err) return next(err);

            if (data.length === 0) {
                return res.status(404).json({ uzenet: "A projekt nem található" });
            }

            const projekt = data[0];
            const datas = [projektId, felhasznaloId];

            //állapot ellenőrzés
            //ha 'torolve' allapotú
            if (projekt.allapot === 'torolve') {
                projectModel.deleteProject(datas, (err) => {
                    if (err) return next(err);
                    res.status(200).json({ uzenet: "projekt véglegesen törölve" });
                });
            } else {
                projectModel.softDeleteProject(datas, (err) => {
                    if (err) return next(err);
                    res.status(200).json({ uzenet: "A projekt a töröltek közé helyezve" })
                });
            }
        })
    },

    //felhasználó eltávolítása a projekt résztvevői közül
    /**
     * @swagger
     * /api/projektek/{projekt_id}/felhasznalo_torles:
     *  delete:
     *      summary: Felhasználó törlése a projekt résztvevői közül
     *      tags: [Projektek]
     *      security:
     *          -   bearerAuth: []
     *      parameters:
     *          -   in: path
     *              name: projekt_id
     *              required: true
     *              type: number
     *      requestBody:
     *          required: true
     *          content:
     *              application/json:
     *                  schema:
     *                      type: object
     *                      properties:
     *                          torlendo_felhasznalo_id:
     *                              type: integer
     *                              description: A törölni kívánt felhasználó azonosítója
     *      responses:
     *          200:
     *              description: Felhasználó törölve a projekt résztvevői közül
     *          403:
     *              description: Nincs admin/manager jogosultság a művelethez
     *          404:
     *              description: A felhasználó nem résztvevője a projektnek
     *          500:
     *              description: Hiba történt a projekt végrehajtása során
     */
    removeUserFromProject: (req, res, next) => {
        const felhasznaloId = req.user.id;
        const projektId = req.params.projekt_id;
        const torlendoFelhasznaloId = req.body.torlendo_felhasznalo_id;
        const datas = [torlendoFelhasznaloId, projektId, felhasznaloId];

        projectModel.selectProjectUserRole(projektId, felhasznaloId, (err, data) => {
            if (err) return next(err);

            if (data.length === 0) {
                return res.status(403).json({ uzenet: 'Nincs admin/manager jogosultság a művelethez' });
            }

            projectModel.deleteUserFromProject(datas, (err, data) => {
                if (err) {
                    return next(err);
                }
                if (data.affectedRows === 0) {
                    return res.status(404).json({
                        uzenet: 'A felhasználó nem résztvevője a projektnek'
                    });
                }
                res.status(200).json({
                    uzenet: "Felhasználó törölve a projekt résztvevői közül"
                });
            })
        })
    }
}

module.exports = projectController;
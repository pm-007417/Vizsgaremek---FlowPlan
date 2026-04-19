const taskModel = require('../models/taskModel');

/**
 * @swagger
 * tags:
 *   name: Feladatok
 *   description: Feladatok kezelése
 */

const taskController = {
    //GET LOGIKA

    //feladat adatainak lekérése
    /**
     * @swagger
     * /api/feladatok/{feladat_id}:
     *  get:
     *      summary: Feladat adatainak lekérdezése
     *      description: Ez a végpont lehetővé teszi egy feladat lekérdezését az adatbázisból, ami a bejelentkezett felhasználóhoz tartozik.
     *      tags: [Feladatok]
     *      security:
     *          -   bearerAuth: []
     *      parameters:
     *          -   in: path
     *              name: feladat_id
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
     *                              projekt_id:
     *                                  type: integer
     *          400:
     *              description: Érvénytelen feladat azonosító
     *          401:
     *              description: Nincs bejelentkezve
     *          403:
     *              description: Nincs jogosultságod ehhez a feladathoz!
     *          404:
     *              description: A feladat nem található
     *          500:
     *              description: Szerverhiba
     */
    getTaskById: (req, res, next) => {
        const feladatId = req.params.feladat_id;
        const felhasznaloId = req.user.id;

        if (isNaN(feladatId)) {
            return res.status(400).json({ uzenet: "Érvénytelen feladat azonosító" });
        }

        taskModel.selectTaskById(feladatId, (err, data) => {
            if (err) return next(err);

            if (data.length === 0) {
                return res.status(404).json({ uzenet: "A feladat nem található" });
            }

            taskModel.selectTaskByIdForUser(feladatId, felhasznaloId, (err, data) => {
                if (err) return next(err);
                if (data.length === 0) {
                    return res.status(403).json({ uzenet: "Nincs jogosultságod ehhez a feladathoz!" });
                }
                res.status(200).json(data[0]);
            });
        })
    },

    //felhasználóhoz tartozó feladatok lekérése
    /**
     * @swagger
     * /api/feladatok/felhasznalo:
     *  get:
     *      summary: Összes, felhasználóhoz tartozó feladat lekérdezése létrehozás dátuma szerint rendezve
     *      description: Ez a végpont lehetővé teszi az összes feladat lekérdezését az adatbázisból, ami a bejelentkezett felhasználóhoz tartozik.
     *      tags: [Feladatok]
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
     *                                  projekt_id:
     *                                      type: integer
     *          401:
     *              description: Nincs bejelentkezve
     *          403:
     *              description: Érvénytelen token
     *          500:
     *              description: Szerverhiba
     */
    getAllUserTasks: (req, res, next) => {
        const felhasznaloId = req.user.id;

        taskModel.selectAllUserTasks(felhasznaloId, (err, data) => {
            if (err) {
                return next(err);
            }
            res.status(200).json(data);
        })
    },

    //feladathoz tartozó felhasználók lekérdezése
    /**
    * @swagger
    * /api/feladatok/{feladat_id}/felhasznalok:
    *  get:
    *      summary: Feladat résztvevőinek lekérdezése
    *      description: Ez a végpont lehetővé teszi az összes résztvevő lekérdezését az adatbázisból, aki a az adott feladathoz tartozik admin vagy manager szerepkörrel rendelkező tagnak.
    *      tags: [Feladatok]
    *      security:
    *          -   bearerAuth: []
    *      parameters:
    *          -   in: path
    *              name: feladat_id
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
    *                                  feladat_id:
    *                                      type: integer
    *                                      descritption: Feladat azonosítója
    *                                  feladat_cim:
    *                                      type: string
    *                                      description: Feladat címe
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
    *              description: Érvénytelen feladat azonosító
    *          401:
    *              description: Nincs bejelentkezve
    *          403:
    *              description: Nem résztvevője a feladatnak, vagy nincs jogosultsága
    *          404:
    *              description: A megadott azonosítóval nem található feladat
    *          500:
    *              description: Szerverhiba
    */
    getAllUsersByTask: (req, res, next) => {
        const feladatId = req.params.feladat_id;
        const felhasznaloId = req.user.id;

        if (isNaN(feladatId)) {
            return res.status(400).json({ uzenet: "Érvénytelen feladat azonosító" });
        }

        taskModel.selectTaskUserRole(feladatId, felhasznaloId, (err, data) => {
            if (err) return next(err);

            if (data.length === 0) {
                return res.status(403).json({
                    uzenet: "Nem résztvevője a feladatnak!"
                });
            }

            taskModel.selectAllUsersByTask(feladatId, (err, data) => {
                if (err) return next(err);
                res.status(200).json(data);
            })
        })

    },

    //feladathoz hozzá nem tartozó felhasználók lekérdezése egy társaságon belül
    /**
    * @swagger
    * /api/feladatok/{feladat_id}/hozzaadhato_felhasznalok:
    *  get:
    *      summary: Feladatban nem résztvevő felhasználók lekérdezése
    *      description: Ez a végpont lehetővé teszi az összes olyan résztvevő lekérdezését az adatbázisból, akik még nem résztvevői a feladatnak, admin vagy manager szerepkörrel rendelkező tag kérheti.
    *      tags: [Feladatok]
    *      security:
    *          -   bearerAuth: []
    *      parameters:
    *          -   in: path
    *              name: feladat_id
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
    *              description: Érvénytelen feladat azonosító
    *          401:
    *              description: Nincs bejelentkezve
    *          404:
    *              description: A megadott azonosítóval nem található feladat
    *          500:
    *              description: Szerverhiba
    */
    getEligibleUsersForTask: (req, res, next) => {
        const feladatId = req.params.feladat_id;

        if (isNaN(feladatId)) {
            return res.status(400).json({ uzenet: "Érvénytelen feladat azonosító" });
        }

        taskModel.selectEligibleUsersForTask(feladatId, (err, data) => {
            if (err) return next(err);
            res.status(200).json(data);
        });
    },

    // feladat üzenet lekérdezése
    /**
     * @swagger
     * /api/feladatok/{feladat_id}/uzenetek:
     *  get:
     *      summary: Feladathoz tartozó üzenetek lekérdezése
     *      description: Ez a végpont lehetővé teszi az összes üzenet lekérdezését az adatbázisból, ami a az adott feladathoz tartozik.
     *      tags: [Feladatok]
     *      security:
     *          -   bearerAuth: []
     *      parameters:
     *          -   in: path
     *              name: feladat_id
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
     *                                  feladat_id:
     *                                      type: integer
     *                                      descrition: Feladat azonosítója
     *          400:
     *              description: Érvénytelen feladat azonosító
     *          401:
     *              description: Nincs bejelentkezve
     *          403:
     *              description: Nem résztvevője a feladatnak!
     *          500:
     *              description: Szerverhiba
     */
    getAllTaskMessages: (req, res, next) => {
        const feladatId = req.params.feladat_id;
        const felhasznaloId = req.user.id;

        if (isNaN(feladatId)) {
            return res.status(400).json({ uzenet: "Érvénytelen feladat azonosító" });
        }

        taskModel.selectTaskUserRole(feladatId, felhasznaloId, (err, data) => {
            if (err) return next(err);

            if (data.length === 0) {
                return res.status(403).json({
                    uzenet: "Nem résztvevője a feladatnak!"
                });
            }

            taskModel.selectTaskMessages(feladatId, (err, data) => {
                if (err) return next(err);
                res.status(200).json(data);
            })
        })
    },

    // POST LOGIKA
    // feladat létrehozása
    /**
     * @swagger
     * /api/feladatok/{projekt_id}/ujfeladat:
     *  post:
     *      summary: Új feladat létrehozása
     *      tags: [Feladatok]
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
     *                              description: A feladat címe
     *                              example: Teszt feladat cím
     *                          leiras:
     *                              type: string
     *                              description: A feladat leírása
     *                              example: Teszt feladat leírása
     *                          hatarido:
     *                              type: string
     *                              format: date
     *                              description: A feladat határideje
     *                          tarsasag_id:
     *                              type: integer
     *                              description: A társaság azonosítója, amihez a feladat tartozik
     *                              example: 1
     *      responses:
     *          201:
     *              description: Feladat sikeresen létrehozva
     *          400:
     *              description: Érvénytelen projekt azonosító
     *          500:
     *              description: Hiba történt a feladat létrehozásakor
     */
    postNewTask: (req, res, next) => {
        const ujFeladat = req.body;
        const projektId = req.params.projekt_id;
        const tulajdonosId = req.user.id;
        const hatarido = ujFeladat.hatarido || null;
        const newDatas = [ujFeladat.cim, ujFeladat.leiras, hatarido, tulajdonosId, ujFeladat.tarsasag_id, projektId, tulajdonosId];

        if (isNaN(projektId)) {
            return res.status(400).json({ uzenet: "Érvénytelen projekt azonosító" });
        }

        taskModel.insertNewTask(newDatas, (err, data) => {
            if (err) {
                return next(err);
            }
            res.status(201).json({
                uzenet: 'Feladat sikeresen létrehozva'
            })
        })
    },

    // felhasználó hozzáadása feladathoz
    /**
     * @swagger
     * /api/feladatok/{feladat_id}/felhasznalo_hozzaadas:
     *  post:
     *      summary: Felhasználó hozzáadása feldathoz
     *      tags: [Feladatok]
     *      security:
     *          -   bearerAuth: []
     *      parameters:
     *          -   in: path
     *              name: feladat_id
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
     *              description: Felhasználó sikeresen hozzáadva a feladathoz.
     *          400:
     *              description: A felhasználó már résztvevője ennek a feladatnak.
     *          403:
     *              description: A felhasználó és a feladat nem egy társasághoz tartozik.
     *          500:
     *              description: Szerverhiba
     */
    postUserToTask: (req, res, next) => {
        const felhasznaloHozzaadId = req.body.felhasznalo_id;
        const feladatId = req.params.feladat_id;
        const datas = [felhasznaloHozzaadId, feladatId, felhasznaloHozzaadId, feladatId];

        if (!felhasznaloHozzaadId || !feladatId) {
            return res.status(400).json({
                uzenet: 'Hiányzó adatok'
            });
        }

        taskModel.insertUserToTask(datas, (err, data) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(406).json({
                        uzenet: 'A felhasználó már résztvevője ennek a feladatnak.'
                    });
                }
                return next(err);
            }

            if (data.affectedRows === 0) {
                return res.status(403).json({
                    uzenet: 'A felhasználó és a feladat nem egy társasághoz tartozik.'
                });
            }

            res.status(201).json({
                uzenet: 'Felhasználó sikeresen hozzáadva a feladathoz.',
            });
        })
    },

    // feladat üzenet létrehozása
    /**
     * @swagger
     * /api/feladatok/{feladat_id}/ujuzenet:
     *  post:
     *      summary: Új üzenet létrehozása
     *      tags: [Feladatok]
     *      security:
     *          -   bearerAuth: []
     *      parameters:
     *          -   in: path
     *              name: feladat_id
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
    postMessageToTask: (req, res, next) => {
        const uzenet = req.body;
        const feladatId = req.params.feladat_id;
        const felhasznaloId = req.user.id;
        const newDatas = [feladatId, felhasznaloId, uzenet.tartalom]

        taskModel.insertTaskMessage(newDatas, (err, data) => {
            if (err) {
                return next(err);
            }
            res.status(201).json({
                uzenet: 'Üzenet sikeresen hozzáadva'
            })
        })
    },

    // PUT LOGIKA
    // feladat módosítása
    /**
     * @swagger
     * /api/feladatok/{feladat_id}/feladat_modositas:
     *  put:
     *      summary: Feladat módosítása
     *      tags: [Feladatok]
     *      security:
     *          -   bearerAuth: []
     *      parameters:
     *          -   in: path
     *              name: feladat_id
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
     *                              description: A feladat címe
     *                              example: Teszt módosított feladat cím
     *                          leiras:
     *                              type: string
     *                              description: A feladat leírása
     *                              example: Teszt módosított feladat leírása
     *                          hatarido:
     *                              type: string
     *                              format: date
     *                              description: A feladat határideje
     *                          allapot:
     *                              type: string
     *                              enum: ['uj','folyamatban','felfuggesztve','kesz','torolve','archivalt']
     *                              description: "A feladat állapota: új/folyamatban/felfüggesztve/kész/törölve/archivált"
     *      responses:
     *          200:
     *              description: Feladat módosítva
     *          500:
     *              description: Hiba történt a feladat módosításakor
     */
    modifyTask: (req, res, next) => {
        const felhasznaloId = req.user.id;
        const modifiedDatas = [req.body.cim, req.body.leiras, req.body.hatarido, req.body.allapot, req.params.feladat_id, felhasznaloId];

        taskModel.updateTask(modifiedDatas, (err, data) => {
            if (err) {
                return next(err);
            }
            res.status(200).json({
                uzenet: 'Feladat módosítva.'
            })
        })
    },

    //DELETE LOGIKA
    //feladat törlése
    /**
     * @swagger
     * /api/feladatok/{feladat_id}/torles:
     *  delete:
     *      summary: Feladat törlése
     *      description: Ha a feladat állapota törölt, akkor véglegesn törlődik, egyéb esetben az állapota töröltre változik.
     *      tags: [Feladatok]
     *      security:
     *          -   bearerAuth: []
     *      parameters:
     *          -   in: path
     *              name: feladat_id
     *              required: true
     *              type: number
     *      responses:
     *          200:
     *              description: A feladat a töröltek közé helyezve
     *          404:
     *              description: A feladat nem található
     *          500:
     *              description: Hiba történt a feladat törlésekor
     */
    deleteUserTask: (req, res, next) => {
        const felhasznaloId = req.user.id;
        const feladatId = req.params.feladat_id;

        //feladat jelenlegi állapotának lekérdezése
        taskModel.selectTaskById(feladatId, (err, data) => {
            if (err) return next(err);

            if (data.length === 0) {
                return res.status(404).json({ uzenet: "A feladat nem található" });
            }

            const feladat = data[0];
            const datas = [feladatId, felhasznaloId];

            //állapot ellenőrzés
            //ha 'torolve' allapotú
            if (feladat.allapot === 'torolve') {
                taskModel.deleteTask(datas, (err) => {
                    if (err) return next(err);
                    res.status(200).json({ uzenet: "Feladat véglegesen törölve" });
                });
            } else {
                taskModel.softDeleteTask(datas, (err) => {
                    if (err) return next(err);
                    res.status(200).json({ uzenet: "A feladat a töröltek közé helyezve" })
                });
            }
        })
    },

    //felhasználó eltávolítása a feladat résztvevői közül
    /**
     * @swagger
     * /api/feladatok/{feladat_id}/felhasznalo_torles:
     *  delete:
     *      summary: Felhasználó törlése a feladat résztvevői közül
     *      tags: [Feladatok]
     *      security:
     *          -   bearerAuth: []
     *      parameters:
     *          -   in: path
     *              name: feladat_id
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
     *              description: Felhasználó törölve a feladat résztvevői közül
     *          403:
     *              description: Nincs admin/manager jogosultság a művelethez
     *          404:
     *              description: A felhasználó nem résztvevője a feladatnak
     *          500:
     *              description: Hiba történt a feladat végrehajtása során
     */
    removeUserFromTask: (req, res, next) => {
        const felhasznaloId = req.user.id;
        const feladatId = req.params.feladat_id;
        const torlendoFelhasznaloId = req.body.torlendo_felhasznalo_id;
        const datas = [torlendoFelhasznaloId, feladatId, felhasznaloId];

        taskModel.selectTaskUserRole(feladatId, felhasznaloId, (err, data) => {
            if (err) return next(err);

            if (data.length === 0) {
                return res.status(403).json({ uzenet: 'Nincs admin/manager jogosultság a művelethez' });
            }

            taskModel.deleteUserFromTask(datas, (err, data) => {
                if (err) {
                    return next(err);
                }
                if (data.affectedRows === 0) {
                    return res.status(404).json({
                        uzenet: 'A felhasználó nem résztvevője a feladatnak'
                    });
                }
                res.status(200).json({
                    uzenet: "Felhasználó törölve a feladat résztvevői közül"
                });
            })
        })
    }
}

module.exports = taskController;
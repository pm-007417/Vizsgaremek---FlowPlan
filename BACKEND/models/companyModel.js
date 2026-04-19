const db = require('../database')

const companyModel = {

    //SELECT
    // Társaság összes tagja
    getAllMembersOfCompany: (tarsasag_id, callback) => {
        const sql = `
        SELECT 
            t.nev AS tarsasag_neve,
            f.id AS felhasznalo_id,
            t.aktiv AS tarsasag_aktiv,
            f.nev AS felhasznalo_nev,
            f.email,
            tt.szerepkor,
            tt.csatlakozas_datum,
            tt.aktiv,
            CASE 
                WHEN t.alapito_id = f.id THEN 'Igen'
                ELSE 'Nem'
            END AS alapito,
            f.letrehozas_datum AS regisztracio_datum
        FROM 
            tarsasag_tartozik tt
            INNER JOIN felhasznalok f ON tt.felhasznalo_id = f.id
            INNER JOIN tarsasagok t ON tt.tarsasag_id = t.id
        WHERE 
            tt.tarsasag_id = ?
        ORDER BY 
            FIELD(tt.szerepkor, 'admin', 'manager', 'tag'),
            f.nev
    `;

        db.query(sql, [tarsasag_id], callback);
    },

    //SELECT
    //Társaság összes projektje
    selectCompanyProjects: (tarsasagId, callback) => {
        const sql = `
        SELECT 
            p.id AS projekt_id,
            p.cim AS nev,
            p.leiras,
            DATE_FORMAT(p.hatarido, '%Y-%m-%d') AS hatarido,
            p.allapot,
            DATE_FORMAT(p.letrehozas_datum, '%Y-%m-%d') AS letrehozas_datum
        FROM projektek p
        WHERE p.tarsasag_id = ?
        ORDER BY p.letrehozas_datum DESC
    `;
        db.query(sql, [tarsasagId], callback);
    },

    //INSERT
    //Társaság létrehozása
    createCompany: (data, callback) => {
        const [nev, alapito_id] = data;

        db.beginTransaction((err) => {
            if (err) {
                return callback(err);
            }

            const sqlTarsasag = `
                INSERT INTO tarsasagok (nev, alapito_id, letrehozas_datum, aktiv)
                VALUES (?, ?, CURDATE(), 1)
            `;

            db.query(sqlTarsasag, [nev, alapito_id], (err, tarsasagEredmeny) => {
                if (err) {
                    return db.rollback(() => {
                        callback(err);
                    });
                }

                const tarsasag_id = tarsasagEredmeny.insertId;

                const sqlTartozik = `
                    INSERT INTO tarsasag_tartozik 
                        (tarsasag_id, felhasznalo_id, szerepkor, csatlakozas_datum, aktiv)
                    VALUES (?, ?, 'admin', CURDATE(), 1)
                `;

                db.query(sqlTartozik, [tarsasag_id, alapito_id], (err, tartozikEredmeny) => {
                    if (err) {
                        return db.rollback(() => {
                            callback(err);
                        });
                    }

                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => {
                                callback(err);
                            });
                        }

                        callback(null, {
                            insertId: tarsasag_id,
                            tarsasag_id: tarsasag_id,
                            uzenet: 'Társaság és alapító tagság sikeresen létrehozva'
                        });
                    });
                });
            });
        });
    },

    //UPDATE
    // Társaság név módosítása
    updateCompanyName: (data, callback) => {
        const sql = `
        UPDATE tarsasagok 
        SET nev = ?
        WHERE id = ?;
    `;
        db.query(sql, data, callback);
    },

    //DELETE
    //Társaság törlése
    deleteCompanyHard: (data, callback) => {
        const sql = `
        DELETE FROM tarsasagok
        WHERE id = ?
        AND alapito_id = ?;`;

        db.query(sql, data, callback);
    },

    //INSERT
    //Új tag hozzáadása
    insertMember: (data, callback) => {

        const {
            tarsasag_id,
            uj_felhasznalo_id,
            szerepkor,
            modosito_id
        } = data;

        const sql = `
    INSERT INTO tarsasag_tartozik
    (tarsasag_id, felhasznalo_id, szerepkor, csatlakozas_datum, aktiv)
    SELECT ?, ?, ?, CURDATE(), 1
    FROM DUAL
    WHERE EXISTS (
        SELECT 1
        FROM tarsasag_tartozik
        WHERE tarsasag_id = ?
        AND felhasznalo_id = ?
        AND szerepkor = 'admin'
        AND aktiv = 1
    )
    AND NOT EXISTS (
        SELECT 1
        FROM tarsasag_tartozik
        WHERE tarsasag_id = ?
        AND felhasznalo_id = ?
    );
    `;

        db.query(sql, [
            tarsasag_id,
            uj_felhasznalo_id,
            szerepkor,

            tarsasag_id,
            modosito_id,

            tarsasag_id,
            uj_felhasznalo_id
        ], callback);
    },

    //UPDATE
    //Szerepkör módosítása
    updateMemberRole: (tarsasag_id, celFelhasznaloId, szerepkor, callback) => {

        const sql = `
    UPDATE tarsasag_tartozik
    SET szerepkor = ?
    WHERE tarsasag_id = ?
    AND felhasznalo_id = ?;
    `;

        db.query(sql, [szerepkor, tarsasag_id, celFelhasznaloId], callback);
    },

    //GET
    //Jogosultság ellenőrzés backendhez
    getUserRoleInCompany: (tarsasag_id, felhasznalo_id, callback) => {

        const sql = `
    SELECT szerepkor
    FROM tarsasag_tartozik
    WHERE tarsasag_id = ?
    AND felhasznalo_id = ?
    AND aktiv = 1
    `;

        db.query(sql, [tarsasag_id, felhasznalo_id], callback);
    },

    //GET
    //Jogosultság ellenőrzés INAKTÍV tagokkal is
    getUserRoleInCompanyWithInactive: (tarsasag_id, felhasznalo_id, callback) => {
        const sql = `
    SELECT szerepkor, aktiv
    FROM tarsasag_tartozik
    WHERE tarsasag_id = ?
    AND felhasznalo_id = ?
    `;

        db.query(sql, [tarsasag_id, felhasznalo_id], callback);
    },

    //UPDATE
    //Társaság deaktiválása
    deactivateCompany: (tarsasag_id, felhasznalo_id, callback) => {

        const sql = `
        UPDATE tarsasagok
        SET aktiv = 0
        WHERE id = ?
        AND alapito_id = ?
        AND aktiv = 1
        `;

        db.query(sql, [tarsasag_id, felhasznalo_id], callback);
    },

    //UPDATE
    //Társaság aktiválása
    activateCompany: (tarsasag_id, felhasznalo_id, callback) => {

        const sql = `
        UPDATE tarsasagok
        SET aktiv = 1
        WHERE id = ?
        AND alapito_id = ?
        AND aktiv = 0
        `;

        db.query(sql, [tarsasag_id, felhasznalo_id], callback);
    },

    //UPDATE
    // FELHASZNÁLÓ DEAKTIVÁLÁSA
    deactivateMember: (felhasznalo_id, tarsasag_id, modosito_id, callback) => {
        const sql = `
        UPDATE tarsasag_tartozik
        SET aktiv = 0
        WHERE felhasznalo_id = ?
        AND tarsasag_id = ?
        AND felhasznalo_id != ?
        AND felhasznalo_id != (
            SELECT alapito_id
            FROM tarsasagok
            WHERE id = ?
        )
        AND EXISTS (
            SELECT 1
            FROM tarsasag_tartozik
            WHERE tarsasag_id = ?
            AND felhasznalo_id = ?
            AND szerepkor IN ('admin','manager')
            AND aktiv = 1
        )
    `;

        db.query(sql, [
            felhasznalo_id,
            tarsasag_id,
            modosito_id,
            tarsasag_id,
            tarsasag_id,
            modosito_id
        ], callback);
    },


    //UPDATE
    // FELHASZNÁLÓ ÚJRAAKTIVÁLÁSA
    activateMember: (tarsasag_id, felhasznalo_id, modosito_id, callback) => {

        const sql = `
    UPDATE tarsasag_tartozik
    SET aktiv = 1,
        csatlakozas_datum = CURDATE()
    WHERE felhasznalo_id = ?
    AND tarsasag_id = ?
    AND aktiv = 0
    AND EXISTS (
        SELECT 1
        FROM tarsasag_tartozik
        WHERE tarsasag_id = ?
        AND felhasznalo_id = ?
        AND szerepkor IN ('admin','manager')
        AND aktiv = 1
    )
    `;

        db.query(sql, [
            felhasznalo_id,
            tarsasag_id,
            tarsasag_id,
            modosito_id
        ], callback);
    },

    // Alapító ellenőrzése
    checkIsFounder: (tarsasag_id, felhasznalo_id, callback) => {
        const sql = `
        SELECT alapito_id, nev 
        FROM tarsasagok 
        WHERE id = ?
    `;

        db.query(sql, [tarsasag_id], callback);
    },

    // ALAPÍTÓ MÓDOSÍTÁS TRANZAKCIÓVAL
    changeFounderWithTransaction: (tarsasag_id, uj_alapito_id, jelenlegi_alapito_id, callback) => {

        db.beginTransaction(err => {
            if (err) return callback(err);

            const sqlChangeFounder = `
            UPDATE tarsasagok
            SET alapito_id = ?
            WHERE id = ?
            AND alapito_id = ?
        `;

            db.query(sqlChangeFounder, [uj_alapito_id, tarsasag_id, jelenlegi_alapito_id], (err, result) => {
                if (err) {
                    return db.rollback(() => callback(err));
                }

                if (result.affectedRows === 0) {
                    return db.rollback(() => {
                        const error = new Error('Alapító módosítás sikertelen');
                        error.statusCode = 403;
                        callback(error);
                    });
                }

                const sqlSetAdmin = `
                UPDATE tarsasag_tartozik
                SET szerepkor = 'admin'
                WHERE tarsasag_id = ?
                AND felhasznalo_id = ?
            `;

                db.query(sqlSetAdmin, [tarsasag_id, uj_alapito_id], (err) => {
                    if (err) {
                        return db.rollback(() => callback(err));
                    }

                    db.commit(err => {
                        if (err) {
                            return db.rollback(() => callback(err));
                        }

                        callback(null, {
                            success: true,
                            message: 'Alapító sikeresen módosítva'
                        });
                    });
                });
            });
        });
    }
}

module.exports = companyModel;
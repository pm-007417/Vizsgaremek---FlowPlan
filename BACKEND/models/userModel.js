const db = require('../database')

const userModel = {
    //SELECT
    // Felhasználó lekérdezése email alapján
    selectUserByEmail: (felhasznaloEmail, callback) => {
        const sql = `SELECT id, nev, email, jelszo FROM felhasznalok WHERE email = ?;`
        db.query(sql, [felhasznaloEmail], callback)
    },

    // Felahsználó társaságai és szerepkörei
    selectUserAllComp: (felhasznalo_id, callback) => {
        const sql = `SELECT t.id AS tarsasag_id, t.nev AS tarsasag_nev, t.aktiv AS tarsasag_aktiv, tt.szerepkor, tt.csatlakozas_datum, tt.aktiv,
                    CASE 
                        WHEN tt.szerepkor = 'admin' THEN 'Teljes jogosultság'
                        WHEN tt.szerepkor = 'manager' THEN 'Projekt kezelési jog'
                        WHEN tt.szerepkor = 'tag' THEN 'Alapszintű hozzáférés'
                    END AS jogosultsag_leiras
                FROM 
                    tarsasag_tartozik tt
                    INNER JOIN tarsasagok t ON tt.tarsasag_id = t.id
                WHERE 
                    tt.felhasznalo_id = ?
                    AND tt.aktiv = 1
                ORDER BY 
                    tt.szerepkor DESC, t.nev;`;
        db.query(sql, [felhasznalo_id], callback)
    },

    //Insert
    //Alap regisztráció
    insertNewUser: (newUser, callback) => {
        const sql = `
        INSERT INTO felhasznalok (nev, email, jelszo)
        VALUES (?, ?, ?);`;
        db.query(sql, newUser, callback);
    },

    //Bejelentkezés
    loginUser: (email, callback) => {
        const sql = `
        SELECT id, nev, email, jelszo
        FROM felhasznalok
        WHERE email = ?;
    `;
        db.query(sql, [email], callback);
    },

    //UPDATE
    // Profil adatok módosítása
    updateUserProfile: (id, nev, email, callback) => {
        const sql = `
        UPDATE felhasznalok
        SET nev = ?, email = ?
        WHERE id = ?;`;

        db.query(sql, [nev, email, id], callback);
    },

    // Jelszó módosítása
    updateUserPassword: (id, jelszo, callback) => {
        const sql = `
        UPDATE felhasznalok
        SET jelszo = ?
        WHERE id = ?;`;

        db.query(sql, [jelszo, id], callback)
    },

    //SELECT
    // Profil megtekintése
    getUserProfile: (userId, callback) => {
        const sql = `
        SELECT 
            id,
            nev,
            email,
            DATE_FORMAT(letrehozas_datum, '%Y.%m.%d') AS letrehozas_datum
        FROM 
            felhasznalok
        WHERE 
            id = ?
    `;
        db.query(sql, [userId], callback);
    },

    // DELETE
    // Felhasználó törlése (alapító társaságokkal együtt)
    deleteUserUser: (id, callback) => { 
        db.beginTransaction(err => {
            if (err) return callback(err);

            const sqlDeleteCompanies = `
            DELETE FROM tarsasagok 
            WHERE alapito_id = ?
        `;

            db.query(sqlDeleteCompanies, [id], (err, companiesResult) => {
                if (err) {
                    return db.rollback(() => callback(err));
                }

                const sqlDeleteMemberships = `
                DELETE FROM tarsasag_tartozik 
                WHERE felhasznalo_id = ?
            `;

                db.query(sqlDeleteMemberships, [id], (err, membershipsResult) => {
                    if (err) {
                        return db.rollback(() => callback(err));
                    }

                    const sqlDeleteUser = `
                    DELETE FROM felhasznalok 
                    WHERE id = ?
                `;

                    db.query(sqlDeleteUser, [id], (err, userResult) => {
                        if (err) {
                            return db.rollback(() => callback(err));
                        }

                        db.commit(err => {
                            if (err) {
                                return db.rollback(() => callback(err));
                            }

                            callback(null, {
                                affectedRows: userResult.affectedRows,
                                deletedCompanies: companiesResult.affectedRows,
                                deletedMemberships: membershipsResult.affectedRows
                            });
                        });
                    });
                });
            });
        });
    }
}

module.exports = userModel;
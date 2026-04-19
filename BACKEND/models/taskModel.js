const db = require('../database');

const taskModel = {
    // SELECT
    selectTaskById: (feladatId, callback) => {
        const sql = `SELECT * FROM feladatok WHERE id = ?;`;
        db.query(sql, feladatId, callback);
    },

    //jogosultság ellenőrzéshez
    selectTaskByIdForUser: (feladatId, felhasznaloId, callback) => {
        const sql = `
        SELECT DISTINCT f.*, p.cim AS projekt_cim, fe.nev AS tulajdonos_nev, t.nev AS tarsasag_nev
        FROM feladatok f
        JOIN felhasznalok fe ON fe.id = f.tulajdonos_id
        JOIN projektek p ON f.projekt_id = p.id
        JOIN tarsasagok t ON t.id = f.tarsasag_id
        LEFT JOIN tarsasag_tartozik tt ON tt.tarsasag_id = f.tarsasag_id AND tt.felhasznalo_id = ? 
        LEFT JOIN feladat_reszvetel fr ON fr.feladat_id = f.id AND fr.felhasznalo_id = ?

        WHERE f.id = ?
          AND (
              fr.felhasznalo_id = ?
              OR f.tulajdonos_id = ?
              OR t.alapito_id = ?
              OR tt.szerepkor = "admin"
          )
        LIMIT 1;
    `;
        db.query(sql, [ felhasznaloId, felhasznaloId, feladatId, felhasznaloId, felhasznaloId, felhasznaloId], callback);
    },

    //Szerepkör ellenőrzés
    selectTaskUserRole: (feladatId, felhasznaloId, callback) => {
        const sql = `
                    SELECT tt.szerepkor
                        FROM feladatok f
                        JOIN tarsasagok t ON t.id = f.tarsasag_id
                        JOIN tarsasag_tartozik tt ON tt.tarsasag_id = t.id
                    WHERE f.id = ?
                        AND tt.felhasznalo_id = ?
                    LIMIT 1;
                    `;
        db.query(sql, [feladatId, felhasznaloId], callback);
    },

    selectAllUserTasks: (felhasznaloId, callback) => {
        const sql = ` 
                    SELECT DISTINCT f.*, p.cim AS projekt_cim, fe.nev AS tulajdonos_nev, t.nev AS tarsasag_nev
                        FROM feladatok f
                        JOIN projektek p ON p.id = f.projekt_id
                        JOIN feladat_reszvetel fr ON f.id = fr.feladat_id
                        JOIN felhasznalok fe ON fe.id = f.tulajdonos_id
                        JOIN tarsasagok t ON f.tarsasag_id = t.id
                    WHERE fr.felhasznalo_id = ? OR f.tulajdonos_id = ?;
                    `;
        db.query(sql, [felhasznaloId, felhasznaloId], callback);
    },

    selectAllUsersByTask: (feladatId, callback) => {
        const sql = `
                   SELECT f.id AS feladat_azonosito, 
                        f.cim, 
                        fe.id AS felhasznalo_azonosito, 
                        fe.nev, 
                        fe.email, 
                        fr.hozzadas_datum, 
                        tt.szerepkor                          
                    FROM felhasznalok fe
                    JOIN feladat_reszvetel fr ON fr.felhasznalo_id = fe.id
                    JOIN feladatok f ON f.id = fr.feladat_id
                    JOIN tarsasag_tartozik tt ON tt.tarsasag_id = f.tarsasag_id
                    AND tt.felhasznalo_id = fe.id
                    WHERE f.id = ?;
                    `;
        db.query(sql, [feladatId], callback);
    },

    selectEligibleUsersForTask: (feladatId, callback) => {
        const sql = `
                    SELECT DISTINCT fe.id, fe.nev, fe.email
                    FROM felhasznalok fe
                    JOIN tarsasag_tartozik tt ON tt.felhasznalo_id = fe.id
                    JOIN feladatok f ON f.tarsasag_id = tt.tarsasag_id
                    WHERE f.id = ?
                    AND fe.id NOT IN (
                        SELECT felhasznalo_id 
                        FROM feladat_reszvetel 
                        WHERE feladat_id = ?
                    );
                `;
        db.query(sql, [feladatId, feladatId], callback);
    },

    selectTaskMessages: (feladatId, callback) => {
        const sql = `
                        SELECT fu.*, f.nev AS felhasznalo_nev
                            FROM feladat_uzenet fu
                            JOIN felhasznalok f ON f.id = fu.felhasznalo_id
                        WHERE feladat_id = ?
                        ORDER BY fu.letrehozas_datum ASC;
                    `;
        db.query(sql, feladatId, callback);
    },

    // INSERT
    insertNewTask: (newDatas, callback) => {
        const sql = `
                        INSERT INTO feladatok 
                            (cim, leiras, hatarido, letrehozas_datum, tulajdonos_id, tarsasag_id, projekt_id)
                        VALUES 
                            (?, ?, ?, CURDATE(), ?, ?, ?);
                        INSERT INTO feladat_reszvetel (felhasznalo_id, feladat_id)
                        VALUES (?,  LAST_INSERT_ID());
                    `;
        db.query(sql, newDatas, callback);
    },

    insertUserToTask: (datas, callback) => {
        const sql = `
                        INSERT INTO feladat_reszvetel (felhasznalo_id, feladat_id, hozzadas_datum)
                        SELECT ?, ?, CURDATE()
                        FROM feladatok f
                        JOIN tarsasag_tartozik tt
                            ON tt.tarsasag_id    = f.tarsasag_id
                            AND tt.felhasznalo_id = ?
                        WHERE f.id   = ?;
                    `;
        db.query(sql, datas, callback);
    },

    insertTaskMessage: (newDatas, callback) => {
        const sql = `
                        INSERT INTO feladat_uzenet (feladat_id, felhasznalo_id, tartalom, letrehozas_datum)
                        VALUES (?, ?, ?, CURRENT_TIMESTAMP);
                    `;
        db.query(sql, newDatas, callback);
    },

    //UPDATE
    updateTask: (modifiedDatas, callback) => {
        const sql = `
                        UPDATE feladatok f
                        JOIN tarsasag_tartozik tt ON tt.tarsasag_id = f.tarsasag_id
                        SET 
                            f.cim = ?, 
                            f.leiras = ?, 
                            f.hatarido = ?, 
                            f.allapot = ?
                        WHERE 
                            f.id = ?
                            AND tt.felhasznalo_id = ?
                            AND tt.szerepkor IN ('admin', 'manager')
                    `;
        db.query(sql, modifiedDatas, callback);
    },

    //soft delete
    softDeleteTask: (datas, callback) => {
        const sql = `
                        UPDATE feladatok f
                            JOIN tarsasag_tartozik t
                                ON t.tarsasag_id = f.tarsasag_id
                            SET f.allapot = 'torolve'
                        WHERE f.id = ?
                        AND t.felhasznalo_id = ?
                        AND t.szerepkor IN ('admin', 'manager');
                    `;
        db.query(sql, datas, callback);
    },

    //DELETE
    //hard delete
    deleteTask: (datas, callback) => {
        const sql = `
                        DELETE f
                        FROM feladatok f
                        JOIN tarsasag_tartozik tt 
                            ON tt.tarsasag_id = f.tarsasag_id
                        WHERE f.id = ?
                        AND tt.felhasznalo_id = ?
                        AND tt.szerepkor IN ('admin', 'manager');

                    `;
        db.query(sql, datas, callback);
    },

    deleteUserFromTask: (datas, callback) => {
        const sql = `
                        DELETE fr
                        FROM feladat_reszvetel fr
                        JOIN feladatok f ON fr.feladat_id = f.id
                        JOIN tarsasag_tartozik tt ON tt.tarsasag_id = f.tarsasag_id
                        WHERE fr.felhasznalo_id = ?
                            AND fr.feladat_id = ?
                            AND tt.felhasznalo_id = ?
                            AND tt.szerepkor IN ('admin', 'manager');
                    `;
        db.query(sql, datas, callback);
    }
}

module.exports = taskModel;
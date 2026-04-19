const db = require('../database');

const projectModel = {
    // SELECT
    selectProjectById: (projektId, callback) => {
        const sql = `SELECT * FROM projektek WHERE id = ?;`;
        db.query(sql, projektId, callback);
    },

    //jogosultság ellenőrzéshez
    selectProjectByIdForUser: (projektId, felhasznaloId, callback) => {
        const sql = `
        SELECT DISTINCT p.*, fe.nev AS tulajdonos_nev, t.nev AS tarsasag_nev
        FROM projektek p
        JOIN felhasznalok fe ON fe.id = p.tulajdonos_id
        JOIN tarsasagok t ON t.id = p.tarsasag_id
        LEFT JOIN tarsasag_tartozik tt ON tt.tarsasag_id = p.tarsasag_id AND tt.felhasznalo_id = ? 
        LEFT JOIN projekt_reszvetel pr ON pr.projekt_id = p.id AND pr.felhasznalo_id = ?
        WHERE p.id = ?
          AND (
              pr.felhasznalo_id = ?
              OR p.tulajdonos_id = ?
              OR t.alapito_id = ?
              OR tt.szerepkor = "admin"
          )
        LIMIT 1;
    `;
        db.query(sql, [ felhasznaloId, felhasznaloId, projektId, felhasznaloId, felhasznaloId, felhasznaloId], callback);
    },

    //Szerepkör ellenőrzés
    selectProjectUserRole: (projektId, felhasznaloId, callback) => {
        const sql = `
                    SELECT tt.szerepkor
                        FROM projektek p
                        JOIN tarsasagok t ON t.id = p.tarsasag_id
                        JOIN tarsasag_tartozik tt ON tt.tarsasag_id = t.id
                    WHERE p.id = ?
                        AND tt.felhasznalo_id = ?
                    LIMIT 1;
                    `;
        db.query(sql, [projektId, felhasznaloId], callback);
    },

    selectAllUsersByProject: (projektId, callback) => {
        const sql = `
                   SELECT p.id AS projekt_azonosito, 
                        p.cim, 
                        fe.id AS felhasznalo_azonosito, 
                        fe.nev, 
                        fe.email, 
                        pr.hozzadas_datum, 
                        tt.szerepkor                          
                    FROM felhasznalok fe
                    JOIN projekt_reszvetel pr ON pr.felhasznalo_id = fe.id
                    JOIN projektek p ON p.id = pr.projekt_id
                    JOIN tarsasag_tartozik tt ON tt.tarsasag_id = p.tarsasag_id
                    AND tt.felhasznalo_id = fe.id
                    WHERE p.id = ?;
                    `;
        db.query(sql, [projektId], callback);
    },

    selectEligibleUsersForProject: (projektId, callback) => {
        const sql = `
                    SELECT DISTINCT fe.id, fe.nev, fe.email
                    FROM felhasznalok fe
                    JOIN tarsasag_tartozik tt ON tt.felhasznalo_id = fe.id
                    JOIN projektek p ON p.tarsasag_id = tt.tarsasag_id
                    WHERE p.id = ?
                    AND fe.id NOT IN (
                        SELECT felhasznalo_id 
                        FROM projekt_reszvetel 
                        WHERE projekt_id = ?
                    );
                `;
        db.query(sql, [projektId, projektId], callback);
    },

    selectProjectsByUser: (felhasznaloId, callback) => {
        const sql = ` 
                    SELECT DISTINCT p.*, p.cim AS projekt_cim, fe.nev AS tulajdonos_nev, t.nev AS tarsasag_nev
                        FROM projektek p
                        JOIN projekt_reszvetel pr ON p.id = pr.projekt_id
                        JOIN felhasznalok fe ON fe.id = p.tulajdonos_id
                        JOIN tarsasagok t ON p.tarsasag_id = t.id
                    WHERE pr.felhasznalo_id = ? OR p.tulajdonos_id = ?;
                    `;
        db.query(sql, [felhasznaloId, felhasznaloId], callback);
    },

    selectProjectTasks: (projektId, callback) => {
        const sql = `
                    SELECT f.* FROM feladatok f 
                        JOIN projektek p ON f.projekt_id = p.id
                    WHERE p.id = ?;
                    `;
        db.query(sql, projektId, callback);
    },

    selectProjectMessages: (projektId, callback) => {
        const sql = `
                        SELECT pu.*, p.nev AS felhasznalo_nev
                            FROM projekt_uzenet pu
                            JOIN felhasznalok p ON p.id = pu.felhasznalo_id
                        WHERE projekt_id = ?
                        ORDER BY pu.letrehozas_datum ASC;
                    `;
        db.query(sql, projektId, callback);
    },

    // INSERT
    insertNewProject: (newDatas, callback) => {
        const sql = `
                        INSERT INTO projektek 
                            (cim, leiras, hatarido, letrehozas_datum, tulajdonos_id, tarsasag_id)
                        VALUES 
                            (?, ?, ?, CURDATE(), ?, ?);
                        INSERT INTO projekt_reszvetel (felhasznalo_id, projekt_id)
                        VALUES (?,  LAST_INSERT_ID());
                    `;
        db.query(sql, newDatas, callback);
    },

    insertUserToProject: (datas, callback) => {
        const sql = `
                        INSERT INTO projekt_reszvetel (felhasznalo_id, projekt_id, hozzadas_datum)
                        SELECT ?, ?, CURDATE()
                        FROM projektek p
                        JOIN tarsasag_tartozik tt
                            ON tt.tarsasag_id = p.tarsasag_id
                            AND tt.felhasznalo_id = ?
                        WHERE p.id   = ?;
                    `;
        db.query(sql, datas, callback);
    },

    insertProjectMessage: (newDatas, callback) => {
        const sql = `
                        INSERT INTO projekt_uzenet (projekt_id, felhasznalo_id, tartalom, letrehozas_datum)
                        VALUES (?, ?, ?, CURRENT_TIMESTAMP);
                    `;
        db.query(sql, newDatas, callback);
    },

    //UPDATE
    updateProject: (modifiedDatas, callback) => {
        const sql = `
                        UPDATE projektek p
                        JOIN tarsasag_tartozik tt ON tt.tarsasag_id = p.tarsasag_id
                        SET 
                            p.cim = ?, 
                            p.leiras = ?, 
                            p.hatarido = ?, 
                            p.allapot = ?
                        WHERE 
                            p.id = ?
                            AND tt.felhasznalo_id = ?
                            AND tt.szerepkor IN ('admin', 'manager')
                    `;
        db.query(sql, modifiedDatas, callback);
    },

    //soft delete
    softDeleteProject: (datas, callback) => {
        const sql = `
                        UPDATE projektek p
                            JOIN tarsasag_tartozik t
                                ON t.tarsasag_id = p.tarsasag_id
                            SET p.allapot = 'torolve'
                        WHERE p.id = ?
                        AND t.felhasznalo_id = ?
                        AND t.szerepkor IN ('admin', 'manager');
                    `;
        db.query(sql, datas, callback);
    },

    //DELETE
    //hard delete
    deleteProject: (datas, callback) => {
        const sql = `
                        DELETE p
                        FROM projektek p
                        JOIN tarsasag_tartozik tt 
                            ON tt.tarsasag_id = p.tarsasag_id
                        WHERE p.id = ?
                        AND tt.felhasznalo_id = ?
                        AND tt.szerepkor IN ('admin', 'manager');

                    `;
        db.query(sql, datas, callback);
    },

    deleteUserFromProject: (datas, callback) => {
        const sql = `
                        DELETE pr
                        FROM projekt_reszvetel pr
                        JOIN projektek p ON pr.projekt_id = p.id
                        JOIN tarsasag_tartozik tt ON tt.tarsasag_id = p.tarsasag_id
                        WHERE pr.felhasznalo_id = ?
                            AND pr.projekt_id = ?
                            AND tt.felhasznalo_id = ?
                            AND tt.szerepkor IN ('admin', 'manager');
                    `;
        db.query(sql, datas, callback);
    }
}

module.exports = projectModel;
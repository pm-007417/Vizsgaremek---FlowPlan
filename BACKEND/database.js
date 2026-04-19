const mysql2 = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, './.env') });

// adatbázis kapcsolat
const db = mysql2.createConnection(
    {
        "host": process.env.HOST,
        "user": process.env.DB_USERNAME, 
        "password": process.env.PASSWORD,
        "database": process.env.DATABASE_NAME,
        "multipleStatements": process.env.MULTIPLE_STATEMENTS
    }
)

//adatbázis kapcsolat ellenőrzése
db.connect(function (hiba) {
    if (hiba) {
        console.error("Hiba a MYSQL kapcsolódás során " + hiba);
        return;
    }
    console.log("Sikeres MYSQL kapcsolat");
})

module.exports = db;
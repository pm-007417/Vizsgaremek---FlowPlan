import { formatDate } from "../utils/formatDate";

export class User {
    /** @type {Number} */
    id;
    /** @type {string} */
    nev;
    /** @type {string} */
    email;
    /** @type {string} */
    hozzadas_datum;

    constructor(id, nev, email, hozzadas_datum, szerepkor) {
        this.id = id;
        this.nev = nev;
        this.email = email;
        this.hozzadas_datum = hozzadas_datum;
        this.szerepkor = szerepkor;
    }

    static fromApi(adat) {
        return new User(
            adat.felhasznalo_azonosito,
            adat.nev,
            adat.email,
            formatDate(adat.hozzadas_datum),
            adat.szerepkor
        );
    }
}
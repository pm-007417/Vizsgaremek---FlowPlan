import { formatDateTime } from "../utils/formatDateTime";


/**
 * Message (Üzenet) modell osztály
 */
export class Message {
    /** @type {Number} */
    id;
    /** @type {string} ISO dátum string */
    letrehozas_datum;
    /** @type {string} */
    tartalom;
    /** @type {Number} */
    felhasznalo_id;
    /** @type {string} */
    felhasznalo_nev;
    /** @type {Number} */
    feladat_id;

    constructor(id, letrehozas_datum, tartalom, felhasznalo_id, felhasznalo_nev, feladat_id) {
        this.id = id;
        this.letrehozas_datum = letrehozas_datum;
        this.tartalom = tartalom;
        this.felhasznalo_id = felhasznalo_id;
        this.felhasznalo_nev = felhasznalo_nev;
        this.feladat_id = feladat_id;        
    }

    /**
     * API válaszból létrehoz egy Message példányt.
     * A backend mezőneveit leképezi a frontend modellre.
     * @param {Object} adat - A backend által visszaadott nyers objektum
     * @returns {Message}
     */
    static fromApi(adat) {
        const message = new Message(adat.id, formatDateTime(adat.letrehozas_datum), adat.tartalom, adat.felhasznalo_id, adat.felhasznalo_nev, adat.feladat_id)
        return message;
    }
}
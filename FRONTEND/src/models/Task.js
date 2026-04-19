import { formatDate } from "../utils/formatDate";

/**
 * Task (Feladat) modell osztály
 */
export class Task {
    /** @type {Number} */
    id;
    /** @type {string} */
    cim;
    /** @type {string} */
    leiras;
    /** @type {string} ISO dátum string */
    hatarido;
    /** @type {string} pl. "nyitott", "folyamatban", "kész" */
    allapot;
    /** @type {string} ISO dátum string */
    letrehozas_datum;
    /** @type {Number} */
    tulajdonos_id;
    /** @type {Number} */
    tarsasag_id;
    /** @type {Number} */
    projekt_id;
    /** @type {string} */
    tulajdonos_nev;
    /** @type {string} */
    tarsasag_nev;

    constructor(id, cim, leiras, hatarido, allapot, letrehozas_datum, tulajdonos_id, tarsasag_id, projekt_id, projekt_cim, tulajdonos_nev, tarsasag_nev) {
        this.id = id;
        this.cim = cim;
        this.leiras = leiras;
        this.hatarido = hatarido;
        this.allapot = allapot;
        this.letrehozas_datum = letrehozas_datum;
        this.tulajdonos_id = tulajdonos_id;
        this.tarsasag_id = tarsasag_id;
        this.projekt_id = projekt_id;
        this.projekt_cim = projekt_cim;
        this.tulajdonos_nev = tulajdonos_nev;
        this.tarsasag_nev = tarsasag_nev;
    }

    /**
     * API válaszból létrehoz egy Task példányt.
     * A backend mezőneveit leképezi a frontend modellre.
     * @param {Object} adat - A backend által visszaadott nyers objektum
     * @returns {Task}
     */
    static fromApi(adat) {
        const feladat = new Task(adat.id, adat.cim, adat.leiras, formatDate(adat.hatarido), adat.allapot,
            formatDate(adat.letrehozas_datum), adat.tulajdonos_id, adat.tarsasag_id, adat.projekt_id, adat.projekt_cim, adat.tulajdonos_nev, adat.tarsasag_nev)
        return feladat;
    }
}
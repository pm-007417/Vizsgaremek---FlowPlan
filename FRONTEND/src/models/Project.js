import { formatDate } from "../utils/formatDate";

/**
 * Project (projekt) modell osztály
 */
export class Project {
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
    /** @type {string} */
    tulajdonos_nev;
    /** @type {string} */
    tarsasag_nev;

    constructor(id, cim, leiras, hatarido, allapot, letrehozas_datum, tulajdonos_id, tarsasag_id, tulajdonos_nev, tarsasag_nev) {
        this.id = id;
        this.cim = cim;
        this.leiras = leiras;
        this.hatarido = hatarido;
        this.allapot = allapot;
        this.letrehozas_datum = letrehozas_datum;
        this.tulajdonos_id = tulajdonos_id;
        this.tarsasag_id = tarsasag_id;
        this.tulajdonos_nev = tulajdonos_nev;
        this.tarsasag_nev = tarsasag_nev;
    }

    /**
     * API válaszból létrehoz egy Project példányt.
     * A backend mezőneveit leképezi a frontend modellre.
     * @param {Object} adat - A backend által visszaadott nyers objektum
     * @returns {Project}
     */
    static fromApi(adat) {
        const projekt = new Project(adat.id, adat.cim, adat.leiras, formatDate(adat.hatarido), adat.allapot,
            formatDate(adat.letrehozas_datum), adat.tulajdonos_id, adat.tarsasag_id, adat.tulajdonos_nev, adat.tarsasag_nev)
        return projekt;
    }
}
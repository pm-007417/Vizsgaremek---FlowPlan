export class CompanyMember {
    /** @type {Number} */
    felhasznalo_id;
    /** @type {string} */
    felhasznalo_nev;
    /** @type {string} */
    email;
    /** @type {string} */
    szerepkor;
    /** @type {string} */
    csatlakozas_datum;
    /** @type {Number} */
    aktiv;
    /** @type {string} */
    alapito;
    /** @type {string} */
    tarsasag_neve;
    /** @type {Number} */
    tarsasag_aktiv;

    constructor(felhasznalo_id, felhasznalo_nev, email, szerepkor, csatlakozas_datum, aktiv, alapito, tarsasag_neve, tarsasag_aktiv) {
        this.felhasznalo_id = felhasznalo_id;
        this.felhasznalo_nev = felhasznalo_nev;
        this.email = email;
        this.szerepkor = szerepkor;
        this.csatlakozas_datum = csatlakozas_datum;
        this.aktiv = aktiv;
        this.alapito = alapito;
        this.tarsasag_neve = tarsasag_neve;
        this.tarsasag_aktiv = tarsasag_aktiv;
    }

    static fromApi(adat) {
        return new CompanyMember(
            adat.felhasznalo_id,
            adat.felhasznalo_nev,
            adat.email,
            adat.szerepkor,
            adat.csatlakozas_datum,
            adat.aktiv,
            adat.alapito,
            adat.tarsasag_neve,
            adat.tarsasag_aktiv
        );
    }

    isFounder() {
        return this.alapito === 'Igen';
    }

    isActive() {
        return this.aktiv === 1;
    }

    isAdmin() {
        return this.szerepkor === 'admin';
    }

    isManager() {
        return this.szerepkor === 'manager';
    }

    isTag() {
        return this.szerepkor === 'tag';
    }

    getFormattedDate() {
        return new Date(this.csatlakozas_datum).toLocaleDateString('hu-HU');
    }
}
export class Company {
    /** @type {Number} */
    id;
    /** @type {string} */
    nev;
    /** @type {string} */
    szerepkor;
    /** @type {string} */
    csatlakozas_datum;
    /** @type {Number} */
    aktiv;
    /** @type {Number} */
    tag_aktiv;

    constructor(id, nev, szerepkor, csatlakozas_datum, aktiv, tag_aktiv) {
        this.id = id;
        this.nev = nev;
        this.szerepkor = szerepkor;
        this.csatlakozas_datum = csatlakozas_datum;
        this.aktiv = aktiv;
        this.tag_aktiv = tag_aktiv;
    }

    static fromApi(adat) {
        return new Company(
            adat.tarsasag_id,
            adat.tarsasag_nev,
            adat.szerepkor,
            adat.csatlakozas_datum,
            adat.tarsasag_aktiv,
            adat.aktiv
        );
    }

    isActive() {
        return this.aktiv === 1;
    }

    isMemberActive() {
        return this.tag_aktiv === 1;
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

    getRoleBadgeClass() {
        switch (this.szerepkor) {
            case 'admin': return 'company-badge-admin';
            case 'manager': return 'company-badge-manager';
            default: return 'company-badge-tag';
        }
    }

    getStatusBadgeClass() {
        return this.isActive() ? 'company-status-active' : 'company-status-inactive';
    }

    getFormattedJoinDate() {
        return new Date(this.csatlakozas_datum).toLocaleDateString('hu-HU');
    }
}
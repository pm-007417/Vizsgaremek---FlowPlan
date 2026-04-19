import { useState } from "react";

/**
 * Általános rendezéstáblázatokhoz.
 * @param {Object[]} adatok - Rendezendő tömb
 * @returns {{
 *   rendezettAdatok: Object[],
 *   rendezesOszlop: string|null,
 *   rendezesIrany: 'asc'|'desc',
 *   sorrendKezeles: (oszlop: string) => void,
 *   mobilSorrendKezeles: (ertek: string) => void,
 * }}
 */
export function useSort(adatok) {
    const [rendezesOszlop, setRendezesOszlop] = useState(null);
    const [rendezesIrany, setRendezesIrany] = useState('asc');

    const sorrendKezeles = (oszlop) => {
        if (rendezesOszlop === oszlop) {
            setRendezesIrany(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setRendezesOszlop(oszlop);
            setRendezesIrany('asc');
        }
    };

    /**
     * Mobil select onChange-hez: pl. "hatarido_asc" → oszlop + irány
     * @param {string} ertek - "oszlop_irany" formátumú string
     */
    const mobilSorrendKezeles = (ertek) => {
        const alahuzas = ertek.lastIndexOf('_');
        const oszlop = ertek.slice(0, alahuzas);
        const irany = ertek.slice(alahuzas + 1);
        setRendezesOszlop(oszlop);
        setRendezesIrany(irany);
    };

    const rendezettAdatok = [...adatok].sort((a, b) => {
        if (!rendezesOszlop) return 0;

        const aErtek = a[rendezesOszlop];
        const bErtek = b[rendezesOszlop];
        const aSzam = Number(aErtek);
        const bSzam = Number(bErtek);

        if (!isNaN(aSzam) && !isNaN(bSzam)) {
            return rendezesIrany === 'asc' ? aSzam - bSzam : bSzam - aSzam;
        }

        const eredmeny = aErtek.toString().localeCompare(bErtek.toString(), 'hu');
        return rendezesIrany === 'asc' ? eredmeny : -eredmeny;
    });

    return { rendezettAdatok, rendezesOszlop, rendezesIrany, sorrendKezeles, mobilSorrendKezeles };
}

export const ALLAPOTOK = [
    { value: 'uj',            label: 'Új' },
    { value: 'folyamatban',   label: 'Folyamatban' },
    { value: 'felfuggesztve', label: 'Felfüggesztve' },
    { value: 'kesz',          label: 'Kész' },
    { value: 'torolve',       label: 'Törölve' },
    { value: 'archivalt',     label: 'Archivált' },
];

export const VALASZTHATO_ALLAPOTOK = ALLAPOTOK.filter(
    a => a.value !== 'torolve' && a.value !== 'archivalt'
);
 
/**
 * DB-ben tárolt értékből megjelenítési szöveget ad vissza.
 * Ha ismeretlen értéket kap, azt adja vissza változatlanul.
 * @param {string} ertek - pl. 'uj', 'kesz'
 * @returns {string} - pl. 'Új', 'Kész'
 */
export function allapotCimke(ertek) {
    return ALLAPOTOK.find(a => a.value === ertek)?.label ?? ertek;
}
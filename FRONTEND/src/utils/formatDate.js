export function formatDate(date){
    if (!date) return '-';
    const datum = new Date(date);
    const ev = datum.getFullYear();
    const ho = String(datum.getMonth() + 1).padStart(2, '0');
    const nap = String(datum.getDate()).padStart(2, '0');
    return `${ev}.${ho}.${nap}.`;
}
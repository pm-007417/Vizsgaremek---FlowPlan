export function formatInputDate(date) {
    if (!date) return '';
    const datum = new Date(date);
    if (isNaN(datum.getTime())) return '';
    return datum.toISOString().split('T')[0];
}
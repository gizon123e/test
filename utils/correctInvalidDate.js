module.exports = function correctInvalidDate(dateString) {
    const date = new Date(dateString);

    if (date.getDate() !== parseInt(dateString.split('-')[2])) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const lastDayOfMonth = new Date(year, month, 0).getDate();

        return `${year}-${month.toString().padStart(2, '0')}-${lastDayOfMonth.toString().padStart(2, '0')}T00:00:00.000Z`;
    }

    return date.toISOString().split('T')[0] + 'T00:00:00.000Z';
}
module.exports = function createDateFromString(dateTimeString) {
    // Memisahkan tanggal dan waktu berdasarkan koma
    const [datePart, timePart] = dateTimeString.split(', ');

    // Memisahkan komponen tanggal (hari, bulan, tahun)
    const [day, month, year] = datePart.split('/').map(Number);

    // Memisahkan komponen waktu (jam, menit)
    const [hours, minutes] = timePart.split(':').map(Number);

    // Membuat objek Date baru
    const date = new Date(year, month - 1, day, hours, minutes);

    return date;
}
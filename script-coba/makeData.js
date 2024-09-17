require('../database/database')
const Excel = require('exceljs');
const mongoose = require('mongoose');
const Decimal128 = mongoose.Types.Decimal128;
const { Pangan } = require('../models/model-pangan');

// async function blah() {
//     const workbook = new Excel.Workbook();

//     // Membaca file CSV
//     const komposisi_pangan = await workbook.csv.readFile("./komposisi_pangan.csv");
//     const deskripsi_makanan = await workbook.csv.readFile("./deskripsi_makanan.csv");
//     const deskripsi_komposisi = await workbook.csv.readFile("./deskripsi_komposisi.csv");

//     const finalData = [];
//     const descriptions = {};
//     const descriptionsMakanan = {};

//     // Membaca setiap baris di file deskripsi komposisi
//     deskripsi_komposisi.eachRow({ includeEmpty: false }, (row, rowNumber) => {
//         if (rowNumber > 1) { // Skip header row
//             const namaKomposisi = row.getCell(1).value;
//             const deskripsiKomposisi = row.getCell(2).value;
//             descriptions[namaKomposisi] = deskripsiKomposisi;
//         }
//     });

//     // Membaca setiap baris di file deskripsi makanan
//     deskripsi_makanan.eachRow({ includeEmpty: false }, (row, rowNumber) => {
//         if (rowNumber > 1) { // Skip header row
//             const kode_bahan = row.getCell(1).value;
//             const nama_makanan_lokal = row.getCell(2).value;
//             const mayoritas_daerah_lokal = row.getCell(3).value;
//             const keterangan = row.getCell(6).value;
//             descriptionsMakanan[kode_bahan] = {
//                 nama_makanan_lokal,
//                 mayoritas_daerah_lokal,
//                 keterangan
//             };
//         }
//     });

//     const kelompok_pangan = {
//         "A": "serelia",
//         "B": "umbi berpati",
//         "C": "kacang, biji",
//         "D": "sayuran",
//         "E": "buah",
//         "F": "daging, unggas",
//         "G": "ikan, kerang, udang",
//         "H": "telur",
//         "J": "susu",
//         "K": "lemak dan minyak",
//         "M": "gula, sirup, konfeksioneri",
//         "N": "bumbu",
//         "Q": "minuman"
//     };

//     const jenis_pangan = {
//         "R": "bahan mentah",
//         "P": "makanan olahan"
//     };

//     komposisi_pangan.eachRow({ includeEmpty: false }, (row, rowNumber) => {
//         if (rowNumber > 1) { // Skip header row
//             const kode_bahan = row.getCell(1).value;
//             const rowData = {
//                 kode_bahan: kode_bahan,
//                 nama_bahan: row.getCell(2).value,
//                 kelompok_pangan: kelompok_pangan[row.getCell(3).value] || '',
//                 jenis_pangan: jenis_pangan[row.getCell(4).value] || '',
//                 nama_makanan_lokal: descriptionsMakanan[kode_bahan]?.nama_makanan_lokal || null,
//                 mayoritas_daerah_lokal: descriptionsMakanan[kode_bahan]?.mayoritas_daerah_lokal || null,
//                 keterangan: descriptionsMakanan[kode_bahan]?.keterangan || null,
//                 air: {
//                     value: Decimal128.fromString(row.getCell(5).value.toString()),
//                     simbol: "H2O",
//                     deskripsi: descriptions['Air'] || ''
//                 },
//                 energi: {
//                     value: Decimal128.fromString(row.getCell(6).value.toString()),
//                     deskripsi: descriptions['Energi'] || ''
//                 },
//                 protein: {
//                     value: Decimal128.fromString(row.getCell(7).value.toString()),
//                     simbol: "PRO",
//                     deskripsi: descriptions['Protein'] || ''
//                 },
//                 lemak: {
//                     value: Decimal128.fromString(row.getCell(8).value.toString()),
//                     simbol: "FAT",
//                     deskripsi: descriptions['Lemak'] || ''
//                 },
//                 kh: {
//                     value: Decimal128.fromString(row.getCell(9).value.toString()),
//                     simbol: "Kh",
//                     deskripsi: descriptions['Kh'] || ''
//                 },
//                 serat: {
//                     value: Decimal128.fromString(row.getCell(10).value.toString()),
//                     simbol: "FIB",
//                     deskripsi: descriptions['Serat'] || ''
//                 },
//                 kalsium: {
//                     value: Decimal128.fromString(row.getCell(11).value.toString()),
//                     simbol: "Ca",
//                     deskripsi: descriptions['Kalsium'] || ''
//                 },
//                 fosfor: {
//                     value: Decimal128.fromString(row.getCell(12).value.toString()),
//                     simbol: "P",
//                     deskripsi: descriptions['Fosfor'] || ''
//                 },
//                 besi: {
//                     value: Decimal128.fromString(row.getCell(13).value.toString()),
//                     simbol: "Fe",
//                     deskripsi: descriptions['Besi'] || ''
//                 },
//                 natrium: {
//                     value: Decimal128.fromString(row.getCell(14).value.toString()),
//                     simbol: "Na",
//                     deskripsi: descriptions['Natrium'] || ''
//                 },
//                 kalium: {
//                     value: Decimal128.fromString(row.getCell(15).value.toString()),
//                     simbol: "K",
//                     deskripsi: descriptions['Kalium'] || ''
//                 },
//                 tembaga: {
//                     value: Decimal128.fromString(row.getCell(16).value.toString()),
//                     simbol: "Cu",
//                     deskripsi: descriptions['Tembaga'] || ''
//                 },
//                 thiamin: {
//                     value: Decimal128.fromString(row.getCell(17).value.toString()),
//                     simbol: "Vit B1",
//                     deskripsi: descriptions['Thiamin'] || ''
//                 },
//                 riboflavin: {
//                     value: Decimal128.fromString(row.getCell(18).value.toString()),
//                     simbol: "Vit B2",
//                     deskripsi: descriptions['Riboflavin'] || ''
//                 },
//                 vitc: {
//                     value: Decimal128.fromString(row.getCell(19).value.toString()),
//                     simbol: "Vit C",
//                     deskripsi: descriptions['Vitc'] || ''
//                 }
//             };
//             finalData.push(rowData);
//         }
//     });

//     // Menyimpan data ke MongoDB
//     try {
//         await Pangan.insertMany(finalData);
//         console.log('Data successfully saved to MongoDB');
//     } catch (error) {
//         console.error('Error saving data to MongoDB:', error);
//     }
// }



async function blah(){
    try {
        const workbook = new Excel.Workbook();

        const nama = await workbook.csv.readFile("./nama_latin.csv");
        const promises = []
        nama.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                const kode_bahan = row.getCell(2).value
                const nama_latin = row.getCell(4).value
                const genus = row.getCell(5).value
                const familia = row.getCell(6).value
                promises.push(
                    Pangan.findOneAndUpdate({kode_bahan}, {
                        nama_latin,
                        genus,
                        familia
                    })
                )
            }
        });
        await Promise.all(promises)
        console.log('done mang')
    } catch (error) {
        
    }
}
blah().catch(err => console.error(err));

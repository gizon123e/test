// const axios = require('axios');
// const cheerio = require('cheerio');

// // URL dari halaman yang ingin di-scrape
// const url = 'https://referensi.data.kemdikbud.go.id/pendidikan/npsn/20221559';

// // https://referensi.data.kemdikbud.go.id/pendidikan/npsn/20200885
// // https://referensi.data.kemdikbud.go.id/pendidikan/npsn/20221559


// // Fungsi untuk melakukan scraping
// async function scrapeData() {
//   try {
//     // Mengirim request ke halaman
//     const { data } = await axios.get(url);

//     // Parsing HTML menggunakan Cheerio
//     const $ = cheerio.load(data);

//     // Mencari elemen <tr> yang mengandung teks "Nama"
//     const nameRow = $('tr:contains("Nama")');

//     // Ekstrak HTML dari elemen tersebut
//     if (nameRow.length > 0) {
//       const nameRowHtml = nameRow.html();
//       console.log('Elemen <tr> yang mengandung teks "Nama":');
//       console.log(nameRowHtml.split("<td>")[4].split("</td>")[0]);
//     } else {
//       console.log('Elemen <tr> yang mengandung teks "Nama" tidak ditemukan');
//     }
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

// // Memanggil fungsi scrapeData
// scrapeData();

const mongoose = require('mongoose');
require('../database/database')
// const MainCategory = require('../models/model-main-category');

// MainCategory.collection.dropIndex('name_1', (err, result) => {
//     if (err) {
//         console.log('Error in dropping index:', err);
//     } else {
//         console.log('Index dropped:', result);
//     }
//     mongoose.connection.close();
// });


// const mongoose = require('mongoose');
const AgeGroup = require('../models/model-kebutuhuan-gizi');

// mongoose.connect('mongodb://localhost:27017/mycloudIndo', { useNewUrlParser: true, useUnifiedTopology: true });

const ageGroupsData = [
  {
    ageRange: '3-6',
    protein: [20, 25],
    lemak: 25,
    karbohidrat: [155, 254],
    serat: [10, 15],
    kalsium: 1000,
    fosfor: 500,
    besi: 10,
    natrium: 900,
    kalium: 2300,
    tembaga: [0.4],
    thiamin: 1.15,
    riboflavin: 0.6,
    vitaminC: 25,
    kalori: 1600
  },
  {
    ageRange: '7-9',
    protein: [35, 40],
    lemak: 25,
    karbohidrat: [155, 254],
    serat: [10, 15],
    kalsium: 1300,
    fosfor: 1200,
    besi: 10,
    natrium: 1000,
    kalium: 2300,
    tembaga: [0.4, 0.7],
    thiamin: 1.15,
    riboflavin: 0.6,
    vitaminC: 45,
    kalori: 1850
  },
  {
    ageRange: '10-12',
    protein: [60, 75],
    lemak: 25,
    karbohidrat: [282],
    serat: [15, 20],
    kalsium: 1300,
    fosfor: 1200,
    besi: 8,
    natrium: 1350,
    kalium: 2400,
    tembaga: [0.9],
    thiamin: 1.15,
    riboflavin: 0.9,
    vitaminC: 50,
    kalori: 2050
  },
  {
    ageRange: '13-17',
    protein: [60, 75],
    lemak: 25,
    karbohidrat: [330],
    serat: [32],
    kalsium: 1300,
    fosfor: 1200,
    besi: 13,
    natrium: 1600,
    kalium: 2650,
    tembaga: [0.9],
    thiamin: 1.15,
    riboflavin: 1.2,
    vitaminC: 70,
    kalori: 2350
  }
];

AgeGroup.insertMany(ageGroupsData)
  .then(() => {
    console.log('Data inserted successfully');
    mongoose.connection.close();
  })
  .catch((error) => {
    console.error('Error inserting data:', error);
  });

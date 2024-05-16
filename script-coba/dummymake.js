require('../database/database')
const Report = require("../models/model-laporan-kinerja-product");
const productId = "661f6ab005432c70eed53377"
const BiayaTetap = require("../models/model-biaya-tetap");

BiayaTetap.create({
    biaya_proteksi: 2000,
    biaya_asuransi: 500,
    biaya_layanan: 1000,
    biaya_jasa_aplikasi: 1000,
    nilai_koin: 0.5
}).then(()=>{
    console.log('berhasil')
})
// const laporan =  Report.findOne({productId}).then(async(laporan)=>{
//     for (let i = 1; i <= 30; i++){
//         const now = new Date()
//         now.setDate(now.getDate() - i)
//         laporan.impressions.push({time: now, amount: Math.floor(Math.random() * 100) + 1})
//         laporan.views.push({time: now, amount: Math.floor(Math.random() * 100) + 1})

//         await laporan.save()
//     }
// })

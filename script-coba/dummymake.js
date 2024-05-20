require('../database/database')
const Report = require("../models/model-laporan-kinerja-product");
const productId = "661f6ab005432c70eed53377"
const BiayaTetap = require("../models/model-biaya-tetap");
const Product = require('../models/model-product');
const Tarif = require("../models/model-tarif");
const VaUser = require("../models/model-user-va");
const Saldo = require("../models/model-saldoApp");
const Fintech = require("../models/model-fintech");
const User = require("../models//model-auth-user")

User.findById("664565fcff8c264b3711e373")
.then((data)=> console.log(data.kode_role))
// Fintech.create({
//     nama_fintech: "gopay paylater"
// }).then(()=>console.log("berhasil"))

// VaUser.create({
//     userId:"6639b6557b19203735a48505",
//     nomor_va:"6238240301620983",
//     nama_bank: "6648a44355062c7fcdf7cd68"
// }).then(()=> console.log('berhasil'))
// const MethodPembayaran = require("../models/model-metode-pembayaran")
// const paylater = require("../models/model-paylater")
// paylater.create({
//     nama_paylater: "kredivo"
// })
// .then(()=>{
//     console.log("berhasil membuat data")
// })


// Tarif.create({
//     jenis_kendaraan: "mobil",
//     jenis_jasa: "hemat",
//     tarif_dasar: 10000,
//     tarif_per_km: 4000
// }).then(()=>{
//     console.log("berhasil membuat data")
// })

// BiayaTetap.create({
//     biaya_proteksi: 2000,
//     biaya_asuransi: 500,
//     biaya_layanan: 1000,
//     biaya_jasa_aplikasi: 1000,
//     nilai_koin: 0.5
// }).then(()=>{
//     console.log('berhasil')
// })
// Product.find().then((datas)=>{
//     const finalData = []
//     for(const data of datas){
//         finalData.push({
//             productId: data._id,
//             image_product: data.image_product
//         })
//     }
//     finalData.forEach(async (item) =>{
//         const editImg = []
//         if(item.image_product.length > 0){
//             for(const img of item.image_product){
//                 if(!img.includes("https://staging-backend.superdigitalapps.my.id")){
//                     const splittedImg = img.split('/public')
//                     splittedImg[0] = "https://staging-backend.superdigitalapps.my.id"
//                     const imgUrl = splittedImg[0] + '/public' + splittedImg[1];
//                     await Product.findByIdAndUpdate(item.productId, { image_product: [imgUrl] });
//                 };
//             }
//         }
//     })
// })
// const laporan =  Report.findOne({productId}).then(async(laporan)=>{
//     for (let i = 1; i <= 30; i++){
//         const now = new Date()
//         now.setDate(now.getDate() - i)
//         laporan.impressions.push({time: now, amount: Math.floor(Math.random() * 100) + 1})
//         laporan.views.push({time: now, amount: Math.floor(Math.random() * 100) + 1})

//         await laporan.save()
//     }
// })

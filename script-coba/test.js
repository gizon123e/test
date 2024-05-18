require('../database/database')

// const MethodPembayaran = require("../models/model-metode-pembayaran")
const Paylater = require("../models/model-paylater");
const VA = require("../models/model-virtual-account");
const Ewallet = require("../models/model-ewallet");
const Gerai = require("../models/model-gerai")

// Gerai.create({
//     nama_gerai: "indomart",
// }).then(()=>{console.log('berhasil')});

Promise.all([
    Paylater.find(),
    Gerai.find(),
    VA.find(),
    Ewallet.find()
]).then((data)=> {
    const dataTerolah = []
    data.forEach((item, i)=>{
        if(i === 0){
            dataTerolah.push({
                metode: "Paylter",
                contents: item
            })
        }else if( i === 1 ){
            dataTerolah.push({
                metode: "Gerai",
                contents: item
            });
        }else if (i === 2){
            dataTerolah.push({
                metode: "Virtual Account",
                contents: item
            });
        }else if (i === 3){
            dataTerolah.push({
                metode: "E-Wallet",
                contents: item
            });
        }
    });
    dataTerolah.forEach(item => console.log(item))
})

// MethodPembayaran.aggregate([
//     {
//         $lookup: {
//             from: "paylaters",
//             localField:"paylaters.paylaterId",
//             foreignField:"_id",
//             as: 'populated_paylaters'
//         }
//     }
// ])
// .then((result) => {
//     console.log(result)
// })
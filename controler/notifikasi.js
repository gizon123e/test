const Pesanan  = require('../models/pesanan/model-orders');
const Notifikasi = require('../models/notifikasi/notifikasi');
const Product = require('../models/model-product');
const DetailNotifikasi = require('../models/notifikasi/detail-notifikasi');
const Pengemasan = require('../models/model-pengemasan');
const {Transaksi} = require('../models/model-transaksi')
const { io } = require("socket.io-client");
const mongoose = require('mongoose');

const now = new Date();
now.setHours(0, 0, 0, 0);
const tomorrow = new Date(now);
tomorrow.setDate(now.getDate() + 1);
const today = new Date();

const dd = String(today.getDate()).padStart(2, '0');
const mm = String(today.getMonth() + 1).padStart(2, '0');
const yyyy = today.getFullYear();

const hh = String(today.getHours()).padStart(2, '0');
const mn = String(today.getMinutes()).padStart(2, '0');
const ss = String(today.getSeconds()).padStart(2, '0');
const date = `${yyyy}-${mm}-${dd}`;
const minutes = `${hh}:${mn}:${ss}`;

function formatTanggal(tanggal){
    const dd = String(tanggal.getDate()).padStart(2, '0');
    const mm = String(tanggal.getMonth() + 1).padStart(2, '0');
    const yyyy = tanggal.getFullYear();
    return `${yyyy}-${mm}-${dd}`
}

function formatWaktu(waktu){
    const hh = String(waktu.getHours()).padStart(2, '0');
    const mn = String(waktu.getMinutes()).padStart(2, '0');
    const ss = String(waktu.getSeconds()).padStart(2, '0');
    return `${hh}:${mn}:${ss}`
}

const socket = io('http://localhost:5000', {
    auth: {
        fromServer: true
    }
})

module.exports = {
     getNotifikasi: async (req, res, next) => {
          try {
               const notifikasi = await DetailNotifikasi.aggregate([
                    {$lookup: {
                         from: "notifikasis",
                         let: { id: "$notifikasiId"},
                         pipeline: [
                              { $match: { 
                                   $expr: { $eq: ["$_id", "$$id"] } } 
                              }
                         ],
                         as: "notif"
                    }},
                    {$unwind: "$notif"},
                    {
                         $match: {
                              "notif.userId": new mongoose.Types.ObjectId(req.user.id)
                         }
                    },
                    {$project: {notif:0}},
                    {$sort: { createdAt: -1 }}
               ])
               // const notifikasi = await Notifikasi.find({userId: req.user.id})
               return res.status(200).json(notifikasi)
          }catch (error) {
            console.log(error);
            next(error)
          }
     },

     sendNotifikasi: async(req, res, next) => {
        try{
          const orders = await Pesanan.find({status: "Berlangsung"}).sort({createdAt: -1}).lean();
          for (const data of orders){
               // console.log(data);
               for( const item of data.items){
                    const deadline = item.deadline;

                    const product = await Product.findOne({_id: item.product[0].productId});
                    const pengemasan = await Pengemasan.findOne({orderId: data._id}).lean()
                    const invoice = await Transaksi.aggregate([
                         {
                              $match: {
                                   id_pesanan: new mongoose.Types.ObjectId(data._id)
                              }
                         },
                         {
                              $project: {_id : 1}
                         },
                         {
                              $lookup: {
                                   from: "invoices",
                                   let: { id_trasaksi: "$_id"},
                                   pipeline: [
                                        { $match: { 
                                             $expr: { $eq: ["$id_transaksi", "$$id_trasaksi"] } } 
                                        }
                                   ],
                                   as: "invoice"
                              }
                         },
                         {
                              $unwind: "$invoice"
                         },
                    ])

                    if(invoice.length == 1){
                         const total_pengemasan_pengiriman = pengemasan?.total_pengemasan_pengiriman * 1000;
                    
                         const waktuMunculNotif = new Date(deadline.getTime() - total_pengemasan_pengiriman);

                         const today = new Date()
                         // today.setDate(today.getDate() + 7)
                         today.setHours(today.getHours() + 9)
                         today.setMinutes(today.getMinutes() + 6)
                         console.log(today)
                         
                         const now = new Date()
                         const notifikasi = await Notifikasi.findOne({invoiceId: invoice[0]._id}).sort({createdAt: -1}).populate('invoiceId');
                         // return res.status(200).json(notifikasi)
                         // console.log(notifikasi)
                         if(now.setSeconds(0,0) == waktuMunculNotif.setSeconds(0,0)){
                              // console.log("HAPPY NEW YEAR");
                              const detailNotifikasi = await DetailNotifikasi.create({
                                   notifikasiId: notifikasi._id,
                                   status: "Pesanan sedang dikemas",
                                   message: `${notifikasi.invoiceId.kode_invoice} sedang dikemas oleh penjual dan akan segera dikirim`,
                                   jenis: "Pesanan",
                                   image_product: product.image_product[0],
                                   createdAt: new Date(),
                              })

                              socket.emit('notif_pesanan_dikemas', {
                                   jenis: detailNotifikasi.jenis,
                                   userId: notifikasi.userId,
                                   status: detailNotifikasi.status,
                                   message: detailNotifikasi.message,
                                   image: detailNotifikasi.image_product,
                                   tanggal: formatTanggal(detailNotifikasi.createdAt),
                              })
                         } else {
                              console.log(`order_id: ${data._id}`);
                              console.log(`waktu sekarang: ${new Date(now.setSeconds(0))}`);
                              console.log(`waktu notif: ${new Date(waktuMunculNotif.setSeconds(0))}`)
                         }
                    } else {
                         for(const item of invoice){
                              const total_pengemasan_pengiriman = pengemasan?.total_pengemasan_pengiriman * 1000;
                              
                              const waktuMunculNotif = new Date(deadline.getTime() - total_pengemasan_pengiriman);

                              const today = new Date()
                              // today.setDate(today.getDate() + )
                              today.setHours(today.getHours() + 9)
                              today.setMinutes(today.getMinutes() + 7)
                              console.log(today)
                              
                              const now = new Date()
                              const notifikasi = await Notifikasi.findOne({invoiceId: item.invoice._id}).sort({createdAt: -1}).populate('invoiceId');
                              
                              if(now.setSeconds(0,0) == waktuMunculNotif.setSeconds(0,0)){
                                   // console.log("HAPPY NEW YEAR");
                                   const detailNotifikasi = await DetailNotifikasi.create({
                                        notifikasiId: notifikasi._id,
                                        status: "Pesanan sedang dikemas",
                                        message: `${notifikasi.invoiceId.kode_invoice} sedang dikemas oleh penjual dan akan segera dikirim`,
                                        jenis: "Pesanan",
                                        image_product: product.image_product[0],     
                                        createdAt: new Date(),
                                   })

                                   socket.emit('notif_pesanan_dikemas', {
                                        jenis: detailNotifikasi.jenis,
                                        userId: notifikasi.userId,
                                        status: detailNotifikasi.status,
                                        message: detailNotifikasi.message,
                                        image: detailNotifikasi.image_product,
                                        tanggal: formatTanggal(detailNotifikasi.createdAt),
                                   })
                              } else {
                                   console.log(`order_id: ${data._id}`);
                                   console.log(`waktu sekarang: ${new Date(now.setSeconds(0))}`);
                                   console.log(`waktu notif: ${new Date(waktuMunculNotif.setSeconds(0))}`)
                              }
                         }
                    }
               }
          }
          } catch (error) {
            console.log(error);
          //   next(error)
          }
     }
}

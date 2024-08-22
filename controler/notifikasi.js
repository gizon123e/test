const Pengiriman  = require('../models/model-pengiriman');
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

const socket = io(process.env.HOST, {
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
                    {
                         $lookup: {
                              from: "invoices",
                              let: { id: "$notif.invoiceId"},
                              pipeline: [
                                   {
                                        $match: {
                                             $expr: { $eq: ["$_id", "$$id"] }
                                        }
                                   }
                              ],
                              as: "invoice"
                         }
                    },
                    {$unwind: "$invoice"},
                    {
                         $lookup: {
                              from: "transaksis",
                              let: { id: "$invoice.id_transaksi"},
                              pipeline: [
                                   {
                                        $match: {
                                             $expr: { $eq: ["$_id", "$$id"] }
                                        }
                                   }
                              ],
                              as: "transaksi"
                         }
                    },
                    {$unwind: "$transaksi"},
                    {
                         $addFields: {
                              id_pesanan: "$transaksi.id_pesanan"
                         }
                    },
                    {$project: {
                         _id: 1,
                         notifikaisiId: 1,
                         status: 1,
                         message: 1,
                         jenis: 1,
                         image_product: 1,
                         is_read: 1,
                         createdAt: 1,
                         id_pesanan: 1,
                    }},
                    {$sort: { createdAt: -1 }}
               ])
               return res.status(200).json({total: notifikasi.length, notifikasi}) 
          }catch (error) {
            console.log(error);
          }
     },

     sendNotifikasi: async(req, res, next) => {
        try{
          const shipments = await Pengiriman.find({sellerApproved: true, waktu_pengiriman: {$gte: now}}).sort({createdAt: -1}).populate("invoice").populate("productToDelivers.productId").lean();
          for (const shipment of shipments){
               const deadline = new Date(shipment.waktu_pengiriman);
               const countdown_pengemasan_vendor = new Date(shipment.waktu_pengiriman).setHours(new Date(shipment.waktu_pengiriman).getHours() - 2);
               const pengemasan = await Pengemasan.findOne({pengirimanId: shipment._id}).lean()
               
               const total_pengemasan_pengiriman = pengemasan?.total_pengemasan_pengiriman * 1000;
               const waktuMunculNotif = new Date(deadline.getTime() - total_pengemasan_pengiriman);
               const now = new Date()

               console.log(`sekarang ${now}`)
               console.log(`muncul notif ${new Date(waktuMunculNotif.setSeconds(0,0))}`)

               const notifikasi = await Notifikasi.findOne({invoiceId: shipment.invoice._id}).sort({createdAt: -1});
               if(now.setSeconds(0,0) == waktuMunculNotif.setSeconds(0,0)){
                    console.log(countdown_pengemasan_vendor)
                    await Pengiriman.findOneAndUpdate({ _id: shipment._id }, { countdown_pengemasan_vendor: countdown_pengemasan_vendor }, { new: true })
                    DetailNotifikasi.create({
                         notifikasiId: notifikasi._id,
                         status: "Pesanan sedang dikemas",
                         message: `${shipment.invoice.kode_invoice} sedang dikemas oleh penjual dan akan segera dikirim`,
                         jenis: "Pesanan",
                         image_product: shipment.productToDelivers[0].productId.image_product[0],
                         createdAt: new Date(),
                    })
                    .then(() => console.log("Berhasil simpan detail notif konsumen"))
                    .catch(() => console.log("Gagal simpan detail notif konsumen"))
                    socket.emit('notif_pesanan_dikemas', {
                         jenis: "Pesanan",
                         userId: notifikasi.userId,
                         status: "Pesanan sedang dikemas",
                         message: `${notifikasi.invoiceId.kode_invoice} sedang dikemas oleh penjual dan akan segera dikirim`,
                         image: shipment.productToDelivers[0].productId.image_product[0],
                         tanggal: `${formatTanggal(new Date())} ${formatWaktu(new Date())}`,
                    })
               } 
          }
          } catch (error) {
               console.log(error);
          }
     },
     readNotifikasi: async(req, res, next) => {
          try{
               const detailNotifikasi = await DetailNotifikasi.findByIdAndUpdate(req.params.id, {is_read: true}, {new: true})
               return res.status(200).json({
                    message: "Notifikasi terbaca",
                    detailNotifikasi
               })   
          } catch(error){
               console.log(error)
          }
     } 
}

const mongoose = require('mongoose')
const Pembatalan = require('./model-pembatalan')
const modelPengiriman = new mongoose.Schema({
    orderId: {
        type: mongoose.Types.ObjectId,
        ref: "Pesanan"
    },
    distributorId: {
        type: mongoose.Types.ObjectId,
        ref: "Distributtor"
    },
    waktu_pengiriman: {
        type: String
    },
    jenis_pengiriman: {
        type: mongoose.Types.ObjectId,
        ref: "JenisJasaDistributor"
    },
    total_ongkir: {
        type: Number
    },
    ongkir: {
        type: Number
    },
    potongan_ongkir: {
        type: Number
    },
    id_jenis_kendaraan: {
        type: mongoose.Types.ObjectId,
        ref: "JenisKendaraan"
    },
    id_toko: {
        type: mongoose.Types.ObjectId,
        ref: "TokoVendor"
    },
    productToDelivers: [{
        _id: false,
        productId: {
            type: String,
            ref: "Product"
        },
        quantity: {
            type: Number
        }
    }],
    status_pengiriman: {
        type: String,
        enum: ["diproses", "dikirim", "pesanan selesai"],
        default: "diproses"
    },
    canceled:{
        type: Boolean,
        default: false
    },
    kode_pengiriman: {
        type: String
    },
    sellerApproved: {
        type: Boolean,
        default: false
    },
    rejected: {
        type: Boolean,
        default: false
    },
    status_distributor: {
        type: String,
        enum: ["Pesanan terbaru", "Diterima", "Ditolak", "Kadaluwarsa", "Selesai"],
        default: "Pesanan terbaru"
    },
    invoice: {
        type: mongoose.Types.ObjectId,
        ref: "Invoice"
    },
    isRequestedToPickUp: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

modelPengiriman.pre(["findOneAndUpdate"], async function (next) {
    if(this.getUpdate().canceled === true){
        const ships = await this.model.find(this.getQuery()).exec();
  
        for (const ship of ships) {
            console.log(ship._id)
            await Pembatalan.create({
                pengirimanId: ship._id,
                userId: this.getUpdate().userId,
                canceledBy: this.getUpdate().canceledBy,
                reason: this.getUpdate().reason
            });
        }
    }
    console.log(this.getQuery())
    next()
})

const Pengiriman = mongoose.model("Pengiriman", modelPengiriman);
module.exports = Pengiriman
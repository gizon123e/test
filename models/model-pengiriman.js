const mongoose = require('mongoose')

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
    id_layanan_kendaraan: {
        type: mongoose.Types.ObjectId,
        ref: "JenisJasaDistributor"
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
    kode_pengiriman: {
        type: String
    },
    rejected: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const Pengiriman = mongoose.model("Pengiriman", modelPengiriman);
module.exports = Pengiriman
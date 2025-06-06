const mongoose = require('mongoose')

const modelProsesPengirimanDistributor = new mongoose.Schema({
    distributorId: {
        type: mongoose.Types.ObjectId,
        ref: "Distributtor",
        required: [true, "distributorId harus di isi"]
    },
    buyerId: {
        type: mongoose.Types.ObjectId,
        refPath: "buyerType",
    },
    buyerType: {
        type: String,
        enum: ['Sekolah', "Vendor", "Supplier"]
    },
    pengirimanId: [{
        type: mongoose.Types.ObjectId,
        ref: "Pengiriman",
        required: [true, 'kirimkan pengirimanId']
    }],
    tokoId: {
        type: mongoose.Types.ObjectId,
        refPath: "tokoType"
    },
    tokoType: {
        type: String,
        required: true,
        enum: ["TokoVendor", "TokoSupplier", "TokoProdusen"]
    },
    jarakPengiriman: {
        type: Number,
        require: [true, "jarakPengiriman harus di isi"]
    },
    jenisPengiriman: {
        type: mongoose.Types.ObjectId,
        ref: "JenisJasaDistributor",
        required: [true, "jenisPengiriman harus di isi"]
    },
    status_distributor: {
        type: String,
        enum: ["Belum dijemput", "Sedang dijemput", "Sudah dijemput", "Sedang dikirim", "Selesai"],
        message: "{VALUE} is not supported",
        required: [true, "status_distributor harus di isi"],
        default: "Belum dijemput"
    },
    optimasi_pengiriman: {
        type: Number,
        require: [true, "optimasi_pengiriman harus di isi"]
    },
    kode_pengiriman: {
        type: String,
        required: [true, "kode_pengiriman harus di isi"]
    },
    tarif_pengiriman: {
        type: Number,
        require: [true, "tarif_pengiriman harus di isi"]
    },
    produk_pengiriman: [{
        _id: false,
        productId: {
            type: String,
            ref: "Product",
            require: [true, "produk_pengiriman harus di isi"]
        },
        quantity: {
            type: Number,
            required: [true, "quantity harus di isi"]
        }
    }],
    jenisKendaraan: {
        type: mongoose.Types.ObjectId,
        ref: "JenisKendaraan",
        required: [true, "jenisKendaraan harus di isi"]
    },
    potongan_ongkir: {
        type: Number,
        required: [true, "potongan_ongkir harus di isi"]
    },
    waktu_pengiriman: {
        type: Date,
        required: [true, "waktu_pengiriman harus di isi"]
    },
    total_berat: {
        type: Number,
        required: [true, "total_berat harus di isi"]
    },
    total_qty: {
        type: Number,
        required: false,
        default: 0
    },
    image_pengiriman: {
        type: String,
        required: false,
        default: null
    },
    id_kendaraan: {
        type: mongoose.Types.ObjectId,
        ref: "KendaraanDistributor",
        required: false,
        default: null
    },
    id_pengemudi: {
        type: mongoose.Types.ObjectId,
        ref: "Pengemudi",
        required: false,
        default: null
    }
}, { timestamps: true })

const ProsesPengirimanDistributor = mongoose.model("ProsesPengirimanDistributor", modelProsesPengirimanDistributor)

module.exports = ProsesPengirimanDistributor
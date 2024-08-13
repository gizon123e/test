const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const operasional = new mongoose.Schema({
    _id: false,
    hari: {
        type: String
    },
    buka: {
        type: Boolean,
    },
    jam_operasional:{
        mulai: {
            type: String
        },
        tutup: {
            type: String
        }
    }
})

const modelTokoVendor = new mongoose.Schema({
    namaToko: {
        type: String,
        required: [true, "Nama Toko Harus diisi"]
    },
    address: {
        type: ObjectId,
        ref: "Address"
    },
    userId: {
        type: ObjectId,
        ref: "User"
    },
    detailId: {
        type: ObjectId,
        ref: "Vendor"
    },
    penilaian_produk: {
        type: Number,
        default: null

    },
    waktu_operasional: {
        type: [operasional],
        default: null
    },
    store_description: {
        type: String,
        default: null
    },
    profile_pict: {
        type: String,
        default: () => `${process.env.HOST}public/profile-picts-store/default.jpg`
    },
    nilai_pinalti: {
        type: Number,
        required: false,
        default: 0
    },
    nilai_review: {
        type: Number,
        required: false,
        default: 0
    }
});

const TokoVendor = mongoose.model("TokoVendor", modelTokoVendor);
module.exports = TokoVendor
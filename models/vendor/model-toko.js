const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const modelTokoVendor = new mongoose.Schema({
    namaToko: {
        type: String,
        required: [true, "Nama Toko Harus diisi"]
    },
    address:{
        type: ObjectId,
        ref: "Address"
    },
    userId: {
        type: ObjectId,
        ref: "User"
    },
    detailId:{
        type: ObjectId,
        ref: "Vendor"
    },
    pengikut: {
        type: Number
    },
    penilaian_produk:{
        type: Number
    },
    waktu_operasional:{
        type: String
    },
    store_description:{
        type: String
    }
});

const TokoVendor = mongoose.model("TokoVendor", modelTokoVendor);
module.exports = TokoVendor
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
    }
});

const TokoVendor = mongoose.model("TokoVendor", modelTokoVendor);
module.exports = TokoVendor
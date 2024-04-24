const mongoose = require("mongoose");
require("./model-product.js");
require("./model-auth-user");

const produksiModels = mongoose.Schema({
    productId: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
        required: [true, "Id dari product yang akan diproduksi dibutuhkan"]
    },
    userId:{
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: [true, "userId dari user yang memiliki role suplier dibutuhkan"]
    },
    quantity:{
        type: Number,
        required: [true, "Jumlah barang yang akan diproduksi dibutuhkan"]
    },
    status:{
        type: String,
        enum: ["Mulai produksi", "Pengolahan produk", "Pengemasan", "Selesai"],
        required: [true, "status produksi dibutuhkan"]
    }
})

const Produksi = mongoose.model("Produksi", produksiModels);
module.exports = Produksi

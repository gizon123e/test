const mongoose = require("mongoose");
require("./model-auth-user");

const bahanBakuModels = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: [true, "Harus ada yang punya bahan baku ini"]
    },
    quantity: {
        type: Number,
        required: [true, "Bahan baku harus ada jumlahnya"],
        min: 1
    }
})

const BahanBaku = mongoose.model("BahanBaku", bahanBakuModels)
module.exports = BahanBaku
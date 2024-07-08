const mongoose = require("mongoose");

const modelPembatalan = new mongoose.Schema({
    pesananId:{
        type: mongoose.Types.ObjectId,
        ref: "Pesanan"
    },
    userId:{
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    canceledBy:{
        type: String,
        enum: ["sistem", "pengguna"]
    }
}, { timestamps: true });

const Pembatalan = mongoose.model("Pembatalan", modelPembatalan);

module.exports = Pembatalan
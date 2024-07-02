const mongoose = require("mongoose");

const modelPembatalan = mongoose.Schema({
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
});

const Pembatalan = mongoose.model("Pembatalan", modelPembatalan);

module.exports = Pembatalan
const mongoose = require("mongoose");

const modelPembatalan = new mongoose.Schema({
    pengirimanId:{
        type: mongoose.Types.ObjectId,
        ref: "Pengiriman"
    },
    userId:{
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    canceledBy:{
        type: String,
        enum: ["sistem", "pengguna"],
        message: '{VALUE} is not valid'
    },
    reason:{
        type: String,
        default: null
    }
}, { timestamps: true });

const Pembatalan = mongoose.model("Pembatalan", modelPembatalan);

module.exports = Pembatalan
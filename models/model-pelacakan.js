const { Decimal128 } = require("mongodb");
const mongoose = require("mongoose");

const modelPelacakan = mongoose.Schema({
    pengirimanId:{
        type: mongoose.Types.ObjectId,
        ref:"Pengiriman"
    },
    pinAlamatAsal:{
        lang: {
            type: Decimal128,
            required: true
        },
        lat:{
            type: Decimal128,
            required: true
        }
    },
    pinAlamatTujuan:{
        lang: {
            type: Decimal128,
            required: true
        },
        lat:{
            type: Decimal128,
            required: true
        }
    },
    jarak:{
        type: String,
    },
    dateTime:{
        type: Date
    },
    status:{
        type: String,
        enum: ["dikonfirmasi", "menyerahkan pesanan", "sedang diantar", "telah diterima"]
    }
});

const Pelacakan = mongoose.model("Pelacakan", modelPelacakan);

module.exports = Pelacakan;
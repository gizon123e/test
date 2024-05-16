const mongoose = require("mongoose");

const modelTarif = mongoose.Schema({
    jenis_kendaraan: {
        type: String,
        enum: ["mobil", "motor"]
    },
    jenis_jasa: {
        type: String,
        enum: ["express", "hemat"]
    },
    tarif_dasar: {
        type: Number
    },
    tarif_per_km:{
        type: Number
    }
});

const Tarif = mongoose.model("Tarif", modelTarif);
module.exports = Tarif
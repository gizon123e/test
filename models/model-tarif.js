const mongoose = require("mongoose");

const modelTarif = mongoose.Schema({
    jenis_kendaraan: {
        type: String,
        enum: ["mobil", "motor", "mobil box"],
        required: [true, 'jenis kendaraan harus di isi']
    },
    jenis_jasa: {
        type: String,
        enum: ["express", "hemat"],
        required: [true, 'jenis jasa harus di isi']
    },
    tarif_dasar: {
        type: Number,
        required: [true, 'tarif dasar harus di isi']
    },
    tarif_per_km: {
        type: Number,
        required: [true, 'tarif per km harus di isi']
    }
});

const Tarif = mongoose.model("Tarif", modelTarif);
module.exports = Tarif
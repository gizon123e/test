const mongoose = require("mongoose");

const modelTarif = mongoose.Schema({
    jenis_kendaraan: {
        type: mongoose.Types.ObjectId,
        ref: "JenisKendaraan",
        required: [true, 'jenis kendaraan harus di isi']
    },
    jenis_jasa: {
        type: mongoose.Types.ObjectId,
        ref: "JenisJasaDistributor",
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
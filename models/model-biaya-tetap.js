const { Decimal128 } = require('mongodb');
const mongoose = require('mongoose');

const modelBiayaTetap = mongoose.Schema({
    biaya_proteksi: {
        type: Number
    },
    biaya_asuransi: {
        type: Number,
    },
    biaya_layanan: {
        type: Number
    },
    biaya_jasa_aplikasi: {
        type: Number
    },
    nilai_koin: {
        type: Decimal128
    },
    biaya_per_kg: {
        type: Number
    },
    constanta_volume: {
        type: Number
    }
});

const BiayaTetap = mongoose.model("BiayaTetap", modelBiayaTetap);

module.exports = BiayaTetap;
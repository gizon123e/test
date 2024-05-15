const mongoose = require("mongoose");
const { Decimal128 } = require('mongodb')

const konsumenModel = mongoose.Schema({
    nama: {
        type: String,
        required: false
    },
    nik: {
        type: String
    },
    file_ktp:{
        type: String,
    },
    namaBadanUsaha: {
        type: String,
        required: false
    },
    nomorAktaPerusahaan:{
        type: String,
    },
    nomorNpwpPerusahaan:{
        type: String,
    },
    npwpFile:{
        type: String,
    },
    nomorNpwp: {
        type: String,
    },
    penanggungJawab:{
        type: mongoose.Types.ObjectId
    },
    address:{
        type: mongoose.Types.ObjectId,
        ref: "Address",
        required: [true, "Harus memiliki alamat"]
    },
    noTeleponKantor:{
        type: String,
        required: false
    },
    jumlahAnggota:{
        type: Number,
        required: false
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: [true, 'userId harus di isi'],
        ref: 'User'
    },
    legalitasBadanUsaha:{
        type: String, 
        required: false
    },
    profile_pict:{
        type: String,
        default: "https://staging-backend.superdigitalapps.my.id/public/profile_picts/default.jpg"
    },
    pinAlamat: {
        long:{
            type: Decimal128
        },
        lat:{
            type: Decimal128
        }
    },
});

const Konsumen = mongoose.model("Konsumen", konsumenModel);

module.exports = Konsumen;
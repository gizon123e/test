const mongoose = require("mongoose");

const vendorModel = new mongoose.Schema({
    nama: {
        type: String,
        required: false
    },
    namaUsaha: {
        type: String,
        required: true
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
    npwpFile:{
        type: String,
    },
    nomorNpwpPerusahaan:{
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
    userId: {
        type: mongoose.Types.ObjectId,
        required: [true, 'userId harus di isi'],
        ref: 'User'
    },
    jenis_kelamin:{
        type: String,
        enum: ["laki", "perempuan"]
    },
    jenis_perusahaan:{
        type: String,
        enum: ["PT", "CV", "Perusahaan Perseorangan", "Firma", "Persero", "PD", "Perum", "Perjan", "Koperasi", "Yayasan"]
    },
    legalitasBadanUsaha:{
        type: String, 
        required: false
    },
    profile_pict:{
        type: String,
        default: "https://staging-backend.superdigitalapps.my.id/public/profile_picts/default.jpg"
    }
})

const Vendor = mongoose.model("Vendor", vendorModel)

module.exports = Vendor
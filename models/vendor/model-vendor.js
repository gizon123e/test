const mongoose = require("mongoose");

const vendorModel = mongoose.Schema({
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
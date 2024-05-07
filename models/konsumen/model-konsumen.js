const mongoose = require("mongoose");

const konsumenModel = mongoose.Schema({
    nama: {
        type: String,
        required: false
    },
    namaBadanUsaha: {
        type: String,
        required: false
    },
    penanggungJawab:{
        type: String,
        required: false
    },
    addressId:{
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
        default: "http://localhost:4000/public/profile_picts/default.jpg"
    },
    coinApps:{
        type: Number,
        default: 0
    }
});

const Konsumen = mongoose.model("Konsumen", konsumenModel);

module.exports = Konsumen;
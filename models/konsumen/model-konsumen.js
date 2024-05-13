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
        default: "https://gull-assuring-pigeon.ngrok-free.app/public/profile_picts/default.jpg"
    },
});

const Konsumen = mongoose.model("Konsumen", konsumenModel);

module.exports = Konsumen;
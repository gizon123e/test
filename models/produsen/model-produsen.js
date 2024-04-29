const mongoose = require("mongoose");

const produsenModel = mongoose.Schema({
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
    userId: {
        type: mongoose.Types.ObjectId,
        required: [true, 'userId harus di isi'],
        ref: 'User'
    },
    noTeleponKantor:{
        type: String,
        required: false
    },
    legalitasBadanUsaha:{
        type: String, 
        required: false
    }
})

const Produsen = mongoose.model("Produsen", produsenModel)

module.exports = Produsen
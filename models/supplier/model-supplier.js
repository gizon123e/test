const mongoose = require("mongoose");

const supplierModel = mongoose.Schema({
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
    userId: {
        type: mongoose.Types.ObjectId,
        required: [true, 'userId harus di isi'],
        ref: 'User'
    },
    legalitasBadanUsaha:{
        type: String, 
        required: false
    }
})

const Supplier = mongoose.model("Supplier", supplierModel)

module.exports = Supplier
const mongoose = require("mongoose")

const modelMerkKendaraan = mongoose.Schema({
    merk: {
        type: String,
        required: [true, 'merk harus di isi']
    },
    jenis: [{
        type: mongoose.Types.ObjectId,
        required: [true, 'jenis harus di isi'],
        ref: "JenisKendaraan"
    }]
})

const MerkKendaraan = mongoose.model("MerkKendaraan", modelMerkKendaraan)

module.exports = MerkKendaraan
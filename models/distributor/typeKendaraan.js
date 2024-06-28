const mongoose = require("mongoose")

const modelTypeKendaraan = new mongoose.Schema({
    nama: {
        type: String,
        required: [true, "nama harus di isi"]
    },
    jenisKendaraan: {
        type: mongoose.Types.ObjectId,
        required: [true, "jenis kendaraan harus di isi"],
        ref: "JenisKendaraan"
    },
    merk: {
        type: mongoose.Types.ObjectId,
        required: [true, "merk harus di isi"],
        ref: "MerkKendaraan"
    }
})

const TypeKendaraan = mongoose.model("TypeKendaraan", modelTypeKendaraan)

module.exports = TypeKendaraan
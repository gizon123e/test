const mongoose = require('mongoose')

const modelDataMurid = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: [true, "Harus memiliki userId"]
    },
    konsumenId: {
        type: mongoose.Types.ObjectId,
        ref: "Konsumen",
        required: [true, "Harus memiliki detailId"]
    },
    nama: {
        type: String,
        required: [true, "nama harus di isi"]
    },
    gender: {
        type: String,
        enum: ["perempuan", "laki-laki"],
        required: [true, "gender harus di isi"]
    },
    nik: {
        type: String,
        required: [true, "nik harus di isi"]
    },
    nisn: {
        type: String,
        required: [true, "nisn harus di isi"]
    },
    pict: {
        type: String,
        required: [true, "pict harus di isi"]
    }
}, { timestamps: true })

const DataMurid = mongoose.model("DataMurid", modelDataMurid)

module.exports = DataMurid
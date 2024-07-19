const mongoose = require('mongoose')

const modelPenanggungJawabKonsumen = mongoose.Schema({
    nama: {
        type: String,
        required: true
    },
    jabatan:{
        type: String,
        required: true
    },
    ktp_file: {
        type: String,
        required: true
    },
    userId:{
        type: mongoose.Types.ObjectId,
        ref:"User",
        required: true
    },
    detailId:{
        type: mongoose.Types.ObjectId,
        ref:"Konsumen",
        required: true
    },
    alamat: {
        type: mongoose.Types.ObjectId,
        ref: "Address"
    },
    file_npwp:{
        type: String,
        required: true
    },
    nomorNpwp:{
        type: String,
        required: true
    },
    nik:{
        type: String,
        required: true
    }
})

const ModelPenanggungJawabKonsumen = mongoose.model("ModelPenanggungJawabKonsumen", modelPenanggungJawabKonsumen);

module.exports = ModelPenanggungJawabKonsumen
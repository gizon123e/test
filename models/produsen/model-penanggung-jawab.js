const mongoose = require('mongoose')

const modelPenanggungProdusen = mongoose.Schema({
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
        ref:"Supplier",
        required: true
    },
    alamat_id: {
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

const ModelPenanggungJawabProdusen = mongoose.model("ModelPenanggungJawabProdusen", modelPenanggungProdusen);

module.exports = ModelPenanggungJawabProdusen
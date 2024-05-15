const mongoose = require('mongoose')

const modelPenanggungJawabKonsumen = mongoose.Schema({
    nama: {
        type: String,
    },
    jabatan:{
        type: String
    },
    ktp_file: {
        type: String,
    },
    alamat: {
        type: mongoose.Types.ObjectId,
        ref: "Address"
    },
    file_npwp:{
        type: String
    }
})

const ModelPenanggungJawabKonsumen = mongoose.model("ModelPenanggungJawabKonsumen", modelPenanggungJawabKonsumen);

module.exports = ModelPenanggungJawabKonsumen
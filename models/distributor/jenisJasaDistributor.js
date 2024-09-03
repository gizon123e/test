const mongoose = require('mongoose')

const modelJenisJasaDistributor = new mongoose.Schema({
    nama: {
        type: String,
        required: [true, 'nama harus di isi']
    },
    icon: {
        type: String,
        required: [true, 'icon harus di isi']
    },
    description: {
        type: String,
        required: [true, 'description harus di isi']
    },
    maximum: {
        type: Number,
        default: null,
        required: [true, 'maximum harus di isi']
    }
})

const JenisJasaDistributor = mongoose.model("JenisJasaDistributor", modelJenisJasaDistributor)

module.exports = JenisJasaDistributor
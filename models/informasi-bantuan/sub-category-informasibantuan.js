const mongoose = require('mongoose')

const modelSubCategoryInformasiPertanyaan = new mongoose.Schema({
    nama: {
        type: String,
        required: [true, 'nama harus di iis']
    },
    id_categori_informasi_bantuan: {
        type: mongoose.Types.ObjectId,
        ref: 'CategoryInformasiPertanyaan',
    },
    type: {
        type: String,
        enum: ["pembeli", "penjual", "perusahaan", "individu"],
        message: "{VALUE} is not supported",
        default: null
    }
}, { timeseries: true })

const SubCategoryInformasiPertanyaan = mongoose.model('SubCategoryInformasiPertanyaan', modelSubCategoryInformasiPertanyaan)
module.exports = SubCategoryInformasiPertanyaan
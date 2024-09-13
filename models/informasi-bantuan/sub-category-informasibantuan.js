const mongoose = require('mongoose')

const modelSubCategoryInformasiPertanyaan = new mongoose.Schema({
    nama: {
        type: String,
        required: [true, 'nama harus di iis']
    },
    id_categori_informasi_bantuan: {
        type: mongoose.Types.ObjectId,
        ref: 'CategoryInformasiPertanyaan',

    }
}, { timeseries: true })

const SubCategoryInformasiPertanyaan = mongoose.model('SubCategoryInformasiPertanyaan', modelSubCategoryInformasiPertanyaan)
module.exports = SubCategoryInformasiPertanyaan
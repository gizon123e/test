const mongoose = require('mongoose')

const modelCategoryInformasiPertanyaan = new mongoose.Schema({
    nama: {
        type: String,
        required: [true, 'nama harus di iis']
    },
    icon: {
        type: String,
        required: [true, 'nama harus di iis']
    },
    role: {
        type: String,
        enum: ["vendor", "konsumen", "produsen", "supplier", "distributor"],
        message: "{VALUE} is not supported",
        required: [true, 'role harus di iis']
    },
    type: {
        type: String,
        enum: ["pembeli", "penjual"],
        message: "{VALUE} is not supported",
        default: null
    }
}, { timeseries: true })

const CategoryInformasiPertanyaan = mongoose.model('CategoryInformasiPertanyaan', modelCategoryInformasiPertanyaan)
module.exports = CategoryInformasiPertanyaan
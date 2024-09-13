const mongoose = require('mongoose')

const modelInformasiBantuanKonsumen = new mongoose.Schema({
    soal: {
        type: String,
        required: [true, 'soal harus di iis']
    },
    jawaban: [{
        description: {
            type: String,
            required: [true, 'jawaban harus di iis']
        },
        sub_description: [{
            text_sub_description: {
                type: String,
            },
            spesifik_description: [{
                type: String,
            }]
        }]
    }],
    id_sub_informasi_bantuan: {
        type: mongoose.Types.ObjectId,
        ref: 'SubCategoryInformasiPertanyaan',
    },
    id_judul_utama: {
        type: mongoose.Types.ObjectId,
        ref: 'CategoryInformasiPertanyaan',
    },
    file_informasi_bantuan: {
        type: String
    },

}, { timeseries: true })

const InformasiBantuanKonsumen = mongoose.model('InformasiBantuanKonsumen', modelInformasiBantuanKonsumen)
module.exports = InformasiBantuanKonsumen
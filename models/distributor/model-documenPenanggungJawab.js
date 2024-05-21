const mongoose = require('mongoose');

const dokumenPenanggungJawabSchema = mongoose.Schema({
    id_penanggung_jawab_distributor: {
        type: mongoose.Types.ObjectId,
        ref: 'PenanggungJawab',
        required: [true, 'ID penanggung jawab distributor harus diisi']
    },
    nik: {
        type: String,
        required: [true, 'NIK harus diisi']
    },
    ktp: {
        type: String,
        required: [true, 'Link ke file KTP harus diisi']
    },
    npwp: {
        type: String,
        required: [true, 'Link ke file NPWP harus diisi']
    }
}, { timestamps: true });

const DokumenPenanggungJawab = mongoose.model('DokumenPenanggungJawab', dokumenPenanggungJawabSchema);

module.exports = DokumenPenanggungJawab;

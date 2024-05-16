const mongoose = require('mongoose');

const alamatPenanggungJawabSchema = mongoose.Schema({
    id_penanggung_jawab_distributor: {
        type: mongoose.Types.ObjectId,
        ref: 'PenanggungJawab',
        required: [true, 'ID penanggung jawab distributor harus diisi']
    },
    alamat_lengkap: {
        type: String,
        required: [true, 'Alamat lengkap harus diisi']
    },
    latitude: {
        type: mongoose.Schema.Types.Decimal128,
        required: [true, 'Latitude harus diisi']
    },
    longitude: {
        type: mongoose.Schema.Types.Decimal128,
        required: [true, 'Longitude harus diisi']
    }
}, { timestamps: true });

const AlamatPenanggungJawab = mongoose.model('AlamatPenanggungJawab', alamatPenanggungJawabSchema);

module.exports = AlamatPenanggungJawab;

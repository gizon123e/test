const mongoose = require('mongoose');

const alamatDistributorSchema = mongoose.Schema({
    id_distributor: {
        type: mongoose.Types.ObjectId,
        ref: 'Distributtor',
        required: [true, 'id_distributor harus di isi']
    },
    alamat_lengkap: {
        type: String,
        required: [true, 'alamat_lengkap harus di isi']
    },
    latitude: {
        type: mongoose.Schema.Types.Decimal128,
        required: [true, 'latitude harus di isi']
    },
    longitude: {
        type: mongoose.Schema.Types.Decimal128,
        required: [true, 'longitude harus di isi']
    }
}, { timestamps: true });

const AlamatDistributor = mongoose.model('AlamatDistributor', alamatDistributorSchema);

module.exports = AlamatDistributor;

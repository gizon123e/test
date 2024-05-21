const mongoose = require('mongoose');

const penanggungJawabSchema = mongoose.Schema({
    id_distributor: {
        type: mongoose.Types.ObjectId,
        ref: 'Distributtor',
        required: [true, 'ID distributor harus diisi']
    },
    nama_penanggungjawab: {
        type: String,
        required: [true, 'Nama penanggung jawab harus diisi']
    },
    jabatan: {
        type: String,
        required: [true, 'Jabatan harus diisi']
    }
}, { timestamps: true });

const PenanggungJawab = mongoose.model('PenanggungJawab', penanggungJawabSchema);

module.exports = PenanggungJawab;

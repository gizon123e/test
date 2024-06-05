const mongoose = require('mongoose');

const dokumenPenanggungJawabSchema = mongoose.Schema({
    id_distributor: {
        type: mongoose.Types.ObjectId,
        ref: 'Distributtor',
        required: [true, 'ID distributor harus diisi']
    },
    address: {
        type: mongoose.Types.ObjectId,
        ref: 'Address',
        required: [true, " id_distributor harus di isi"],
    },
    nama_penanggungjawab: {
        type: String,
        required: [true, 'Nama penanggung jawab harus diisi']
    },
    jabatan: {
        type: String,
        required: [true, 'Jabatan harus diisi']
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

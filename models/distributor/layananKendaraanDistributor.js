const mongoose = require('mongoose')

const modelLayananKendaraanDistributor = new mongoose.Schema({
    id_distributor: {
        type: mongoose.Types.ObjectId,
        required: [true, "id_distributor harus di isi"],
        ref: "Distributtor"
    },
    jenisKendaraan: {
        type: mongoose.Types.ObjectId,
        required: [true, "jenis kendaraan harus di isi"],
        ref: "JenisKendaraan"
    },
    tarifId: {
        type: mongoose.Types.ObjectId,
        required: [true, 'tarifId harus di isi'],
        ref: "Tarif"
    },
})

const LayananKendaraanDistributor = mongoose.model("LayananKendaraanDistributor", modelLayananKendaraanDistributor)

module.exports = LayananKendaraanDistributor
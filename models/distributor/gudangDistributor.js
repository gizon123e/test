const mongoose = require('mongoose')

const modelGudangDistributor = mongoose.Schema({
    id_distributor: {
        type: mongoose.Types.ObjectId,
        required: [true, 'id_distributor harus di isi'],
        ref: 'Distributtor'
    },
    alamat_id: {
        type: mongoose.Types.ObjectId,
        required: [true, 'alamat_id harus di isi'],
        ref: "Address"
    },
    nama_toko: {
        type: String,
        required: [true, 'nama toko harus di isi']
    }
})

const GudangDistributor = mongoose.model("GudangDistributor", modelGudangDistributor)

module.exports = GudangDistributor
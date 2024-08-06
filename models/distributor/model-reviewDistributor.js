const mongoose = require('mongoose')

const modelReviewDistributor = new mongoose.Schema({
    id_distributor: {
        type: mongoose.Types.ObjectId,
        ref: "Distributtor",
        required: [true, "id_distributor harus di isi"]
    },
    nilai_ketepatan: {
        type: Number,
        required: false,
        default: 0
    },
    nilai_komunikasi: {
        type: Number,
        required: false,
        default: 0
    },
    id_konsumen: {
        type: mongoose.Types.ObjectId,
        ref: "Konsumen",
        required: [true, "id_konsumen harus di isi"]
    },
    id_produk: {
        type: String,
        ref: "Product",
        required: [true, "id_produk harus di isi"]
    },
    id_toko: {
        type: mongoose.Types.ObjectId,
        ref: "TokoVendor",
        required: [true, "id_toko harus di isi"]
    },
    id_address: {
        type: mongoose.Types.ObjectId,
        ref: "Address",
        required: [true, "id_toko harus di isi"]
    },
    id_jenis_pengiriman: {
        type: mongoose.Types.ObjectId,
        ref: 'JenisJasaDistributor',
        required: [true, 'id_jenis_pengiriman harus di isi'],
        default: 0
    },
    nilai_total_review: {
        type: Number,
        required: [true, 'nilai_total_review harus di isi']
    }
}, { timestamps: true })

const ReviewDistributor = mongoose.model("ReviewDistributor", modelReviewDistributor)

module.exports = ReviewDistributor
const mongoose = require('mongoose');

const modelOrder = mongoose.Schema({
    product: [{
        _id: false,
        productId: {
            type: mongoose.Types.ObjectId,
            required: [true, 'Productid harus di isi'],
            ref: 'Product',
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity harus di isi'],
            min: 1,
            default: 1
        }
    }],
    userId: {
        type: mongoose.Types.ObjectId,
        required: [true, 'userId harus di isi'],
        ref: 'User'
    },
    addressId: {
        type: mongoose.Types.ObjectId,
        required: [true, 'addressId harus di isi'],
        ref: 'Address'
    },
    date_order: {
        type: String,
        required: [true, 'date Order harus di isi']
    },
    status: {
        type: String,
        required: [true, 'status harus di isi'],
        enum: ["Belum Bayar", "Berlangsung", "Berhasil", "Dibatalkan"],
        default: "Belum Bayar"
    },
    catatan_produk: {
        type: String
    },
    poinTerpakai: {
        type: Number
    },
    biaya_proteksi: {
        type: Boolean,
        default: false
    },
    biaya_asuransi: {
        type: Boolean,
        default: false
    },
    ongkir: {
        type: Number
    },
    potongan_ongkir: {
        type: Number
    },
    dp: {
        type: Boolean
    },
    is_dibatalkan: {
        type: Boolean,
        default: false
    }
}, { timestamp: true }
)

const Pesanan = mongoose.model('Pesanan', modelOrder)

module.exports = Pesanan
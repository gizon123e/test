const mongoose = require('mongoose');

const modelOrder = new mongoose.Schema({
    product: [{
        _id: false,
        productId: {
            type: String,
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
    deadline:{
        type: Date,
        validate: {
            validator: (date) => {
                const currentDate = new Date();
                const minDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
                return date >= minDate
            },
            message: "Deadline minimal 7 hari ke depan"
        }
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
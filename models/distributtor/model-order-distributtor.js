const mongoose = require('mongoose')

const modelOrderDistributtor = mongoose.Schema({
    date_order: {
        type: String,
        required: [true, 'date_order harus di isi']
    },
    distributtorId: {
        type: mongoose.Types.ObjectId,
        required: [true, 'distributtorId harus di isi'],
        ref: 'Distributtor'
    },
    tujuan_alamat: {
        type: mongoose.Types.ObjectId,
        required: [true, 'tujuan_alamat harus di isi'],
        ref: 'Address'
    },
    user_orderId: {
        type: mongoose.Types.ObjectId,
        required: [true, 'userOrderId harus di isi'],
        ref: 'User'
    },
    order_product: {
        type: mongoose.Types.ObjectId,
        required: [true, 'productId harus di isi'],
        ref: 'Orders'
    },
    status_order: {
        type: String,
        required: [true, 'statusOrder harus di isi'],
        enum: ['Proses', 'Verifikasi Pengiriman', 'Verifikasi Penerimah', 'Cancel'],
        default: 'Proses'
    },
    optimasi_hari: {
        type: Number,
        required: false,
        default: null
    }
}, { timestamp: true })

const OrderDistributtor = mongoose.model('OrderDistributtor', modelOrderDistributtor)

module.exports = OrderDistributtor
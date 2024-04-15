const mongoose = require('mongoose')

const modelOrderDistributtor = mongoose.Schema({
    date_order_distributtor: {
        type: String,
        required: [true, 'date_order_distributtor harus di isi']
    },
    distributtorId: {
        type: mongoose.Types.ObjectId,
        required: [true, 'distributtorId harus di isi'],
        ref: 'Distributtor'
    },
    price: {
        type: Number,
        required: [true, 'price harus di isi']
    },
    tujuan_alamat: {
        type: mongoose.Types.ObjectId,
        required: [true, 'tujuan_alamat harus di isi'],
        ref: 'Address'
    },
    userOrderId: {
        type: mongoose.Types.ObjectId,
        required: [true, 'userOrderId harus di isi'],
        ref: 'User'
    },
    productId: {
        type: mongoose.Types.ObjectId,
        required: [true, 'productId harus di isi'],
        ref: 'Product'
    },
    statusOrder: {
        type: String,
        required: [true, 'statusOrder harus di isi'],
        enum:['DiKemas', 'Dikirim', 'Verifikasi Penerimah'],
    }
}, { timestamp: true })

const OrderDistributtor = mongoose.model('OrderDistributtor', modelOrderDistributtor)

module.exports = OrderDistributtor
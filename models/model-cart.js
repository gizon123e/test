const mongoose = require('mongoose')

const modelCarts = new mongoose.Schema({
    productId: {
        type: String,
        required: [true, "productId harus di isi"],
        ref: 'Product'
    },
    varian:[
        {   
            _id: false,
            harga: {
                type: Number,
                default: null
            },
            nama_varian: {
                type: String
            },
            nilai_varian:{
                type: String
            }
        }
    ],
    quantity: {
        type: Number,
        min: [1, 'minimal quantity adalah 1'],
        required: [true, 'quantity harus di isi'],
        default: 1
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: [true, "userId harus di isi"],
        ref: 'User'
    },
    total_price: {
        type: Number,
        required: [true, 'total price harus di isi'],
    },
    productTerhapus: {
        type: {
            _id: String,
            name_product: {
                type: String
            },
            total_price: {
                type: Number
            },
            image_product: [
                String
            ],
        },
        default: null
    },
    productDeleted:{
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const Carts = mongoose.model('Carts', modelCarts)

module.exports = Carts
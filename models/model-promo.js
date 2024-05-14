const mongoose = require('mongoose')

const modelPromo = mongoose.Schema({
    productId: {
        type: mongoose.Types.ObjectId,
        ref: "Product"
    },
    typePromo:{
        type: String,
        enum: ['cashback', 'harga', 'barang'],
        required: [true, 'Tipe Promo Harus Diisi']
    },
    banner:{
        type: String,
        required: true
    }
});

const Promo = mongoose.model('Promo', modelPromo);

module.exports = Promo;
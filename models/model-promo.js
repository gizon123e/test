const mongoose = require('mongoose')

const modelPromo = mongoose.Schema({
    prodoctId: {
        type: mongoose.Types.ObjectId,
        ref: "Product"
    },
    banner:{
        type: String,
        required: true
    }
});

const Promo = mongoose.model('Promo', modelPromo);

module.exports = Promo;
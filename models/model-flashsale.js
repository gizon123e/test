const mongoose = require('mongoose');

const flashSaleModel = mongoose.Schema({
    categoryId:{
        type:[{
            _id: false,
            value:{
                type: mongoose.Types.ObjectId,
                ref: "SpecificCategory"
            }
        }]
    },
    startTime:{
        type: Date,
        required: true
    },
    endTime:{
        type: Date,
        required: true
    },
    potonganHarga:{
        type: Number
    }
})

const FlashSale = mongoose.model('FlashSale', flashSaleModel);

module.exports = FlashSale
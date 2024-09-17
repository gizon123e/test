const mongoose = require('mongoose');

const flashSaleModel = new mongoose.Schema({
    nama: {
        type: String
    },
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
    },
    stokAwal:[
        {
            _id: false,
            productId: {
                type: mongoose.Types.ObjectId
            },
            value: {
                type: Number
            }
        }
    ]
})
flashSaleModel.pre('findOneAndUpdate', async function(next){
    const fs = await this.model.findOne(this.getQuery());
    if(new Date(fs.startTime) < new Date() && new Date(fs.endTime) > new Date()) {
        return next(new Error("Tidak Bisa mengedit Flash Sale yang Sedang Berlangsung"));
    }

    if(new Date(fs.endTime) < new Date()){
        return next(new Error("Tidak Bisa mengedit Flash Sale yang Sudah Berlangsung"));
    }
    next()
})
const FlashSale = mongoose.model('FlashSale', flashSaleModel);

module.exports = FlashSale
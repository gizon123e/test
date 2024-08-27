const mongoose = require('mongoose')
require('./model-product')

const performanceReport = new mongoose.Schema({
    tokoId:{
        type: mongoose.Types.ObjectId,
        refPath:"tokoType",
        required: [true, "tokoId harus diisi"],
    },
    tokoType:{
        type: String,
        enum: ["TokoVendor", "TokoSupplier", "TokoProdusen"]
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref:"User",
        required: [true, "userId harus diisi"],
        index: true
    }
}, {timestamps: true}) 

const SellerPerformanceReport = mongoose.model("SellerPerformanceReport", performanceReport)
module.exports = SellerPerformanceReport
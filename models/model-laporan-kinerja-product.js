const mongoose = require('mongoose')
require('./model-product')

const performanceReport = new mongoose.Schema({
    productId:{
        type: String,
        ref:"Product",
        required: [true, "productId harus diisi"],
        index: true
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref:"User",
        required: [true, "productId harus diisi"],
        index: true
    }
}, {timestamps: true}) 

const ProductPerformanceReport = mongoose.model("ProductPerformanceReport", performanceReport)
module.exports = ProductPerformanceReport
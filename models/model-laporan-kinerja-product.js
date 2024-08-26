const mongoose = require('mongoose')
require('./model-product')

const performanceReport = new mongoose.Schema({
    productId:{
        type: mongoose.Types.ObjectId,
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
}) 

const ProductPerformanceReport = mongoose.model("ProductPerformanceReport", performanceReport)
module.exports = ProductPerformanceReport
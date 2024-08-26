const mongoose = require('mongoose')
require('./model-product')

const performanceReport = new mongoose.Schema({
    productId:{
        type: mongoose.Types.ObjectId,
        ref:"Product",
        required: [true, "productId harus diisi"],
        index: true
    },
    
}) 

const PerformanceReport = mongoose.model("PerformanceReport", performanceReport)
module.exports = PerformanceReport
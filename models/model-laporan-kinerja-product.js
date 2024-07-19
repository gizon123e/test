const mongoose = require('mongoose')
require('./model-product')

const performanceReport = mongoose.Schema({
    productId:{
        type: mongoose.Types.ObjectId,
        ref:"Product",
        required: [true, "productId harus diisi"]
    },
    impressions:[{
        _id: false,
        time: {
            type: Date,
            default: Date.now()
        },
        amount: {
            type: Number,
            required: true,
            default: 0
        }
    }],
    views:[
        {
            _id: false,
            time:{
                type: Date,
                default: Date.now()
            },
            amount: {
                type: Number,
                required: true,
                default: 0
            }
        }
    ]
}) 

const PerformanceReport = mongoose.model("PerformanceReport", performanceReport)
module.exports = PerformanceReport
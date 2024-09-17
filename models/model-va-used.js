const mongoose = require('mongoose');

const modelVaUsed = new mongoose.Schema({
    nomor_va:{
        type: String,
    },
    orderId:{
        type: mongoose.Types.ObjectId,
        ref: 'DetailPesanan'
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: '1d' }
    } 
});

const VA_Used = mongoose.model("Used_VA", modelVaUsed);
module.exports = VA_Used
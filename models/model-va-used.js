const mongoose = require('mongoose');

const modelVaUsed = new mongoose.Schema({
    nomor_va:{
        type: String,
    },
    orderId:{
        type: mongoose.Types.ObjectId,
        ref: 'DetailPesanan'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: '1d' }  // TTL index to expire documents 7 days after creation
    } 
});

const VA_Used = mongoose.model("VA_Used", modelVaUsed);
module.exports = VA_Used
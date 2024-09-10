const mongoose = require('mongoose');
const modelIncompleteOrders = new mongoose.Schema({
    pengirimanId: {
        type: mongoose.Types.ObjectId,
        ref: "Pengiriman",
        required: true
    },
    userIdKonsumen: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    userIdSeller: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    completedOrders:{
        type: Number,
        required: true
    },
    persentase: {
        type: Number
    }
}, { timestamps: true })

const IncompleteOrders = mongoose.model('IncompleteOrders', modelIncompleteOrders);
module.exports = IncompleteOrders;
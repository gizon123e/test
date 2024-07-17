const mongoose = require('mongoose');
const modelData = new mongoose.Schema({
    transaksiId: {
        type: mongoose.Types.ObjectId,
        ref: "Transaksi"
    },
    pesananId:{
        type: mongoose.Types.ObjectId,
        ref: "Pesanan"
    },
    dataProduct:[{
        type: Object
    }]
});

const DataProductOrder = mongoose.model("DataProductOrder", modelData);

module.exports = DataProductOrder
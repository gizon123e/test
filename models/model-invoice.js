const mongoose = require("mongoose");

const modelInvoice = mongoose.Schema({
    id_transaksi: {
        type: mongoose.Types.ObjectId,
        ref: "Transaksi"
    },
    userId:{
        type: mongoose.Types.ObjectId,
        ref:"User"
    },
    kode_invoice:{
        type: String
    }
});

const Invoice = mongoose.model("Invoice", modelInvoice);
module.exports = Invoice
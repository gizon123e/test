const mongoose = require('mongoose');
const modelPembayaranInvoice = new mongoose.Schema({
    invoiceIds: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Invoice"
        }
    ],
    total_tagihan:{
        type: Number
    },
    paymentNumber: {
        type: Number
    }
});

const PembayaranInvoice = mongoose.model("PembayaranInvoice", modelPembayaranInvoice);

module.exports = PembayaranInvoice
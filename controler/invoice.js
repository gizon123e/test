const Invoice = require("../models/model-invoice");
const Pengiriman = require("../models/model-pengiriman");
const { Transaksi } = require("../models/model-transaksi");

module.exports = {
    detailInvoice: async (req, res, next) => {
        try {
            const transaksiSubsidi = await Transaksi.findOne({id_pesanan: req.params.id, subsidi: true});
            const transaksiTambahan = await Transaksi.findOne({id_pesanan: req.params.id, subsidi: false});

            const invoiceTambahan = await Invoice.findOne({id_transaksi: transaksiTambahan._id});
            const invoiceSubsidi = await Invoice.findOne({id_transaksi: transaksiSubsidi._id});

            const pengirimanSubsidi = await Pengiriman.find({invoice: invoiceSubsidi._id})
            const pengirimanTambahan = await Pengiriman.find({invoice: invoiceTambahan._id})

        } catch (error) {
            
        }
    }
}
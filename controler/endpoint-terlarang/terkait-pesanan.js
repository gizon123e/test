const ProsesPengirimanDistributor = require("../../models/distributor/model-proses-pengiriman");
const Invoice = require("../../models/model-invoice");
const Pengiriman = require("../../models/model-pengiriman");
const { Transaksi, Transaksi2 } = require("../../models/model-transaksi");
const Pesanan = require("../../models/pesanan/model-orders");

module.exports = async (req, res, next) => {
    try {
        if(req.headers.authorization !== "QkrS1oIcHBvvJ8COylJeF2zmxJwp2E6G") return res.status(403).json({message: "Mau Ngapain Ler???"})
        await Promise.all([
            Pesanan.deleteMany({}),
            Pengiriman.deleteMany({}),
            ProsesPengirimanDistributor.deleteMany({}),
            Transaksi.deleteMany({}),
            Transaksi2.deleteMany({}),
            Invoice.deleteMany({})
        ]);
        return res.json({message: "berhasil"})
    } catch (error) {
        console.log(error);
        next(error)
    }
}
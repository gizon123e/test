const ProsesPengirimanDistributor = require("../../models/distributor/model-proses-pengiriman");
const Invoice = require("../../models/model-invoice");
const Pengiriman = require("../../models/model-pengiriman");
const { Transaksi, Transaksi2 } = require("../../models/model-transaksi");
const DetailNotifikasi = require("../../models/notifikasi/detail-notifikasi");
const Notifikasi = require("../../models/notifikasi/notifikasi");
const DataProductOrder = require("../../models/pesanan/model-data-product-order");
const Pesanan = require("../../models/pesanan/model-orders");
const Pengemasan = require("../../models/model-pengemasan");

module.exports = async (req, res, next) => {
    try {
        if(req.headers.authorization !== "QkrS1oIcHBvvJ8COylJeF2zmxJwp2E6G") return res.status(403).json({message: "Mau Ngapain Ler???"})
        await Promise.all([
            Pesanan.deleteMany({}),
            Pengiriman.deleteMany({}),
            ProsesPengirimanDistributor.deleteMany({}),
            Transaksi.deleteMany({}),
            Transaksi2.deleteMany({}),
            Invoice.deleteMany({}),
            DetailNotifikasi.deleteMany({}),
            Notifikasi.deleteMany({}),
            DataProductOrder.deleteMany({}),
            Pengemasan.deleteMany({})
        ]);
        return res.json({message: "berhasil"})
    } catch (error) {
        console.log(error);
        next(error)
    }
}
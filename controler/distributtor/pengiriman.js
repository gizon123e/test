const Pengiriman = require("../../models/model-pengiriman");
const Distributtor = require('../../models/distributor/model-distributor')
const TokoVendor = require('../../models/vendor/model-toko')
const Product = require('../../models/model-product')
const Konsumen = require('../../models/konsumen/model-konsumen')
const KendaraanDistributor = require('../../models/distributor/model-kendaraanDistributtor')
const Address = require('../../models/model-address')
const Pengemudi = require('../../models/distributor/model-pengemudi')
// const BiayaTetap = require('../../models/model-biaya-tetap')
// const User = require('../../models/model-auth-user')
// const LayananKendaraanDistributor = require('../../models/distributor/layananKendaraanDistributor')
// const Gratong = require('../../models/model-gratong')

module.exports = {
    requestPickUp: async (req, res, next) => {
        try {
            const pengiriman = await Pengiriman.findOne({ _id: req.params.id, id_toko: req.body.sellerId });
            if (!pengiriman) return res.status(404).json({ message: `Pengiriman dengan Id ${req.params.id} tidak ditemukan` })
            if (pengiriman.status_distributor === 'Pesanan terbaru') return res.status(403).json({ message: "Distributor belum bersedia" })
            const updatedPengiriman = await Pengiriman.findOneAndUpdate(
                { _id: req.params.id, id_toko: req.body.sellerId },
                {
                    isRequestedToPickUp: true,
                },
                { new: true });
            return res.status(200).json({ message: "Berhasil Mengajukan Pengajuan", data: updatedPengiriman })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
}
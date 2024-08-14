const ProsesPengirimanDistributor = require('../../models/distributor/model-proses-pengiriman');
const PelacakanDistributorKonsumen = require('../../models/konsumen/pelacakanDistributorKonsumen');
const Konsumen = require('../../models/konsumen/model-konsumen');
const TokoVendor = require('../../models/vendor/model-toko');
const Sekolah = require('../../models/model-sekolah');

module.exports = {
    getTrekingDistributor: async (req, res, next) => {
        try {
            const { id_toko, id_distributor, pengirimanId, id_sekolah } = req.params;

            const konsumen = await Sekolah.findOne({ userId: req.user.id, _id: id_sekolah })
            if (!konsumen) return res.status(404).json({ message: 'konsumen tidak ada' })

            const pengiriman = await ProsesPengirimanDistributor.findOne({ pengirimanId: pengirimanId })
            if (!pengiriman) return res.status(404).json({ message: "pengiriman id not found" })

            const toko = await TokoVendor.findById(id_toko)
            if (!toko) return res.status(404).json({ message: "toko vendor id not found" })

            const location = await PelacakanDistributorKonsumen.find({ id_toko: id_toko, id_distributor: id_distributor, id_pesanan: pengiriman._id, id_konsumen: id_sekolah })
                .populate('id_toko').populate('id_distributor').populate('id_konsumen').populate('id_address').populate({
                    path: 'id_pesanan',
                    populate: "produk_pengiriman.productId"
                })

            if (location.length === 0) {
                return res.status(404).json({ message: 'Lokasi tidak ditemukan' });
            }
            res.status(200).json({
                message: "get data succees",
                data: location
            });
        } catch (error) {
            console.log(error)
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                })
            }

            next(error);
        }
    },

    getDetailLacakanDistributor: async (req, res, next) => {
        try {
            const lacak = await ProsesPengirimanDistributor.findOne({ _id: req.params.id })
                .populate('pengirimanId').populate('produk_pengiriman.productId').populate({
                    path: "id_kendaraan",
                    populate: "jenisKendaraan",
                    populate: "merekKendaraan"
                })
                .populate("id_pengemudi")

            if (!lacak) return res.status(404).json({ message: "data Lacak Not Found" })

            res.status(200).json({
                message: "get data lacak success",
                data: lacak
            })
        } catch (error) {
            console.log(error)
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                })
            }

            next(error);
        }
    }
}
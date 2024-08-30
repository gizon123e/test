const ProsesPengirimanDistributor = require('../../models/distributor/model-proses-pengiriman');
const PelacakanDistributorKonsumen = require('../../models/konsumen/pelacakanDistributorKonsumen');
const Konsumen = require('../../models/konsumen/model-konsumen');
const TokoVendor = require('../../models/vendor/model-toko');
const Sekolah = require('../../models/model-sekolah');

module.exports = {
    getTrekingDistributor: async (req, res, next) => {
        try {
            const { id_toko, id_distributor, pengirimanId, id_sekolah } = req.params;

            if (req.user.role === 'konsumen') {
                const konsumen = await Sekolah.findOne({ userId: req.user.id, _id: id_sekolah })
                if (!konsumen) return res.status(404).json({ message: 'konsumen tidak ada' })
            } else {
                const konsumen = await Sekolah.findOne({ _id: id_sekolah })
                if (!konsumen) return res.status(404).json({ message: 'konsumen tidak ada' })
            }

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
                .populate('produk_pengiriman.productId')
                .populate({
                    path: "id_kendaraan",
                    populate: [
                        { path: "jenisKendaraan" },
                        { path: "merekKendaraan" }
                    ]
                })
                .populate("jenisKendaraans")
                .populate("id_pengemudi")
                .populate({
                    path: "tokoId",
                    populate: "address"
                })
                .populate({
                    path: "sekolahId",
                    populate: "address"
                })

            if (!lacak) return res.status(404).json({
                message: "Link pengiriman pesanan tidak tersedia",
                text: "Silakan cek ulang link pengeriman pesanan yang sesuai untuk akses pengiriman"
            })

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
    },

    lacakLokasiDitributor: async (req, res, next) => {
        try {
            const { latitude, longitude, id_toko, id_distributor, pengirimanId } = req.body

            const data = await PelacakanDistributorKonsumen.findOne({ id_toko: id_toko, id_distributor: id_distributor, id_pesanan: pengirimanId })
            if (!data) return res.status(404).json({ message: "data Pelacakan Distributor tidak di temukan" })

            const dataLacak = await PelacakanDistributorKonsumen.findOneAndUpdate({ id_toko: id_toko, id_distributor: id_distributor, id_pesanan: pengirimanId }, { latitude, longitude }, { new: true })

            res.status(200).json({
                message: "get data lacak success",
                data: dataLacak
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
            next(error)
        }
    }
}
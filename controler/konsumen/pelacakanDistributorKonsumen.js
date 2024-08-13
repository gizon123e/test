const ProsesPengirimanDistributor = require('../../models/distributor/model-proses-pengiriman');
const PelacakanDistributorKonsumen = require('../../models/konsumen/pelacakanDistributorKonsumen');
const Konsumen = require('../../models/konsumen/model-konsumen');
const TokoVendor = require('../../models/vendor/model-toko');
const Sekolah = require('../../models/model-sekolah');

module.exports = {
    getTrekingDistributor: async (req, res) => {
        try {
            const { id_toko, id_distributor, pengirimanId, id_sekolah } = req.params;

            console.log({ id_toko, id_distributor, pengirimanId });

            const konsumen = await Sekolah.findOne({ userId: req.user.id, _id: id_sekolah })
            if (!konsumen) return res.status(404).json({ message: 'konsumen tidak ada' })
            console.log(konsumen._id)

            const pengiriman = await ProsesPengirimanDistributor.findOne({ pengirimanId: pengirimanId })
            if (!pengiriman) return res.status(404).json({ message: "pengiriman id not found" })

            const toko = await TokoVendor.findById(id_toko)
            if (!toko) return res.status(404).json({ message: "toko vendor id not found" })

            const location = await PelacakanDistributorKonsumen.find({ id_toko: id_toko, id_distributor: id_distributor, id_pesanan: pengiriman._id, id_konsumen: '6695d8d312db45597a24b32e' });
            // const location = await PelacakanDistributorKonsumen.find({ id_toko: '666689dd30b2f454ab83035f', id_distributor: '666c197fb5c6e1cf1924d722', id_pesanan: '66bac8fa3471fd2bad154613', id_konsumen: '66a21874d6d9472eed93c53a' });
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

    createPelacakanDistributorKonsumen: async (req, res, next) => {
        try {
            const { id_toko, id_address, latitude, longitude, id_distributor, id_pesanan, id_konsumen, } = req.body

            const data = await PelacakanDistributorKonsumen.create({
                id_toko,
                id_address,
                latitude,
                longitude,
                id_distributor,
                id_pesanan,
                id_konsumen,
                statusPengiriman: 'Pesanan diserahkan ke distributor'
            })

            res.status(201).json({
                message: "create data success",
                data
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
}
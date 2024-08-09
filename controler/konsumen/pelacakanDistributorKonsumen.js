const ProsesPengirimanDistributor = require('../../models/distributor/model-proses-pengiriman');
const PelacakanDistributorKonsumen = require('../../models/konsumen/pelacakanDistributorKonsumen');
const Konsumen = require('../../models/konsumen/model-konsumen');

module.exports = {
    getTrekingDistributor: async (req, res) => {
        try {
            const { id_toko, id_distributor, pengirimanId } = req.params;

            const konsumen = await Konsumen.findOne({ userId: req.user.id })
            if (!konsumen) return res.status(404).json({ message: 'konsumen tidak ada' })

            const processPengiriman = await ProsesPengirimanDistributor.findOne({ pengirimanId: pengirimanId })
            if (!processPengiriman) return res.status(404).json({ message: "pesanan id not found" })

            const location = await PelacakanDistributorKonsumen.find({ id_toko, id_distributor, id_pesanan: processPengiriman._id });
            if (!location) {
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
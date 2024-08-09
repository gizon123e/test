const Pengiriman = require("../../models/model-pengiriman");

module.exports = {
    requestPickUp: async (req, res, next) => {
        try {
            const pengiriman = await Pengiriman.findByIdAndUpdate(req.params.id, { isRequestedToPickUp: true })
            if (!pengiriman) return res.status(404).json({ message: `Pengiriman dengan Id ${req.params.id} tidak ditemukan` })
            return res.status(200).json({ message: "update data success" })
        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    createPencarianUlangDistributor: async (req, res, next) => {
        try {
            const { orderId, id_toko, kode_pengiriman, distributorId, id_jenis_kendaraan, id_jenis_layanan, potongan_ongkir } = req.body

            if (!orderId || !id_toko || !kode_pengiriman || !distributorId || !id_jenis_kendaraan, !id_jenis_layanan, !potongan_ongkir) {
                return res.status(400).json({ message: "orderId, id_toko, kode_pengiriman, distributorId, id_jenis_kendaraan, id_jenis_layanan, potongan_ongkir harus di isi" })
            }

            const pengiriman = await Pengiriman.find({ orderId, id_toko, kode_pengiriman });
            if (!pengiriman) return res.status(404).json({ message: `Pengiriman tidak ditemukan` })

            await Pengiriman.updateMany({ orderId, id_toko, kode_pengiriman }, {
                distributorId,
                status_distributor: "Pesanan terbaru",
                rejected: false,
                status_pengiriman: 'diproses',
                id_jenis_kendaraan,
                id_jenis_layanan,
                potongan_ongkir
            })

            res.status(200).json({ message: "update data success" })
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}
const Distributtor = require("../../models/distributor/model-distributor")
const ProsesPengirimanDistributor = require("../../models/distributor/model-proses-pengiriman")
const Pengiriman = require("../../models/model-pengiriman")

module.exports = {
    getAllDasboard: async (req, res, next) => {
        try {
            const { hariIni, Kemarin, tujuMinggu, custom } = req.query

            const today = new Date();
            const formattedDate = today.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });

            today.setDate(today.getDate() - 1);
            const formattedDateHariKemarin = today.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });

            today.setDate(today.getDate() - 7);
            const formattedDateTujuhHariLalu = today.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });

            const distributor = await Distributtor.findOne({ userId: req.user.id })
            if (!distributor) return res.status(404).json({ message: "data Distributor Not Found" })

            const pengiriman = await ProsesPengirimanDistributor.find({ distributorId: distributor._id, status_pengiriman: "Selesai" })
            if (pengiriman.length === 0) return res.status(400).json({ message: "pesanan pengiriman saat ini masih kosong" });

            const dataMapPengiriman = pengiriman.map((data) => {
                console.log(data)

                const datePesanan = new Date(data.createdAt);
                const formattedDatePesanan = datePesanan.toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
            })

            res.status(200).json({
                message: "get data dasboard success",

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
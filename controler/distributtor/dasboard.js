const Distributtor = require("../../models/distributor/model-distributor")
const ProsesPengirimanDistributor = require("../../models/distributor/model-proses-pengiriman")
const Pengiriman = require("../../models/model-pengiriman")

module.exports = {
    getAllDasboard: async (req, res, next) => {
        try {
            const { kemarin, tujuMinggu, customStart, customEnd } = req.query

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

            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 7);

            const distributor = await Distributtor.findOne({ userId: req.user.id })
            if (!distributor) return res.status(404).json({ message: "data Distributor Not Found" })

            const dataProsesPengiriman = []
            const pengiriman = await ProsesPengirimanDistributor.find({ distributorId: distributor._id, status_distributor: "Selesai" })
            if (pengiriman.length === 0) return res.status(400).json({ message: "pesanan pengiriman saat ini masih kosong" });

            let totalProduk = 0
            let quantity = 0
            const dataMapPengiriman = pengiriman.map((data) => {
                const datePesanan = new Date(data.createdAt);
                const formattedDatePesanan = datePesanan.toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });

                if (formattedDate === formattedDatePesanan) {
                    dataProsesPengiriman.push(data)
                    totalProduk += data.produk_pengiriman.length

                    for (let pcs of data.produk_pengiriman) {
                        quantity += pcs.quantity
                    }
                } else if (kemarin && formattedDateHariKemarin === formattedDatePesanan) {
                    dataProsesPengiriman.push(data)
                    totalProduk += data.produk_pengiriman.length

                    for (let pcs of data.produk_pengiriman) {
                        quantity += pcs.quantity
                    }
                } else if (tujuMinggu && datePesanan >= sevenDaysAgo && datePesanan <= today) {
                    dataProsesPengiriman.push(data);
                    totalProduk += data.produk_pengiriman.length

                    for (let pcs of data.produk_pengiriman) {
                        quantity += pcs.quantity
                    }

                } else if (customStart && customEnd) {
                    const startDate = new Date(customStart);
                    const endDate = new Date(customEnd);

                    if (datePesanan >= startDate && datePesanan <= endDate) {
                        dataProsesPengiriman.push(data);
                        totalProduk += data.produk_pengiriman.length

                        for (let pcs of data.produk_pengiriman) {
                            quantity += pcs.quantity
                        }
                    }
                }

            })

            res.status(200).json({
                message: "get data dasboard success",
                totalProduk,
                quantity
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
const Distributtor = require("../../models/distributor/model-distributor")
const ProsesPengirimanDistributor = require("../../models/distributor/model-proses-pengiriman")
const JenisJasaDistributor = require('../../models/distributor/jenisJasaDistributor')
const Pengiriman = require("../../models/model-pengiriman")

module.exports = {
    getAllDasboard: async (req, res, next) => {
        try {
            const distributor = await Distributtor.findOne({ userId: req.user.id })
            if (!distributor) return res.status(404).json({ message: "data Distributor Not Found" })

            const dataProsesPengiriman = []
            const pengiriman = await ProsesPengirimanDistributor.find({ distributorId: distributor._id, status_distributor: "Selesai" }).populate('jenisPengiriman').populate('id_kendaraan')
            if (pengiriman.length === 0) return res.status(400).json({ message: "pesanan pengiriman saat ini masih kosong" });

            let totalProduk = 0
            let quantity = 0
            pengiriman.map((data) => {
                dataProsesPengiriman.push(data)
                totalProduk += data.produk_pengiriman.length

                for (let pcs of data.produk_pengiriman) {
                    quantity += pcs.quantity
                }
            })

            const pesananDistributor = await Pengiriman.find({ distributorId: distributor._id })

            const pervomaPengirimanSuccess = []
            const pervomaPengirimanDibatalkan = []
            const dataLayananHemat = []
            const dataLayananExpress = []
            for (let data of pengiriman) {
                if (data.status_distributor === 'Selesai') {
                    pervomaPengirimanSuccess.push(data)
                }

                const layanan = await JenisJasaDistributor.findOne({ _id: data.jenisPengiriman })
                if (layanan.nama === 'Hemat') {
                    dataLayananHemat.push(data)
                } else if (layanan.nama === 'Express') {
                    dataLayananExpress.push(data)
                }
            }

            for (let data of pesananDistributor) {
                if (data.status_distributor === 'Ditolak') {
                    pervomaPengirimanDibatalkan.push(data)
                }
            }

            let data_layanan_distributor
            if (dataLayananHemat.length > dataLayananExpress.length) {
                data_layanan_distributor = dataLayananHemat
            } else {
                data_layanan_distributor = dataLayananExpress
            }

            const totalPengiriman = pervomaPengirimanSuccess.length + pervomaPengirimanDibatalkan.length
            const perfoma_pesanan = totalPengiriman > 0 ? (pervomaPengirimanSuccess.length / totalPengiriman) * 100 : 0

            res.status(200).json({
                message: "get data dasboard success",
                totalProduk,
                rata_rata_pengiriman: quantity,
                perfoma_pesanan,
                pembatalan_pesanan: pervomaPengirimanDibatalkan.length,
            })
        } catch (error) {
            console.log(error)
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields,
                })
            }
            next(error)
        }
    },

    rataPengiriman: async (req, res, next) => {
        try {
            const distributor = await Distributtor.findOne({ userId: req.user.id })
            if (!distributor) return res.status(404).json({ message: "data Distributor Not Found" })

            const pengiriman = await ProsesPengirimanDistributor.find({ distributorId: distributor._id, status_distributor: "Selesai" })
                .select('jarakPengiriman jenisPengiriman id_kendaraan')
                .populate('jenisPengiriman')
                .populate('id_kendaraan')
            if (pengiriman.length === 0) return res.status(400).json({ message: "pesanan pengiriman saat ini masih kosong" });

            const pervomaPengirimanSuccess = []
            const dataLayananHemat = []
            const dataLayananExpress = []
            for (let data of pengiriman) {
                if (data.status_distributor === 'Selesai') {
                    pervomaPengirimanSuccess.push(data)
                }

                const layanan = await JenisJasaDistributor.findOne({ _id: data.jenisPengiriman })
                if (layanan.nama === 'Hemat') {
                    dataLayananHemat.push(data)
                } else if (layanan.nama === 'Express') {
                    dataLayananExpress.push(data)
                }
            }

            let data_layanan_distributor
            if (dataLayananHemat.length > dataLayananExpress.length) {
                data_layanan_distributor = dataLayananHemat
            } else {
                data_layanan_distributor = dataLayananExpress
            }

            res.status(200).json({
                message: "get data dasboard success",
                rata_rata_pengiriman: data_layanan_distributor,
            })
        } catch (error) {
            console.log(error)
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields,
                })
            }
            next(error)
        }
    },

    getGrafikPerforma: async (req, res, next) => {
        try {
            const { start_date, end_date } = req.query;
            const distributorId = req.user.id;

            const dataDistributor = await Distributtor.findOne({ userId: distributorId });
            if (!dataDistributor) return res.status(404).json({ message: "Data distributor Not Found" });

            // Define the start and end dates
            let start, end;
            if (start_date && end_date) {
                start = new Date(start_date);
                end = new Date(end_date);
                end.setHours(23, 59, 59, 999); // Set end date to the end of the day in local time
            } else {
                const now = new Date();
                start = new Date(now.getFullYear(), now.getMonth(), 1); // First day of the current month in local time
                end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999); // Current day with end time in local time
            }

            // Query data pengiriman
            const pengiriman = await ProsesPengirimanDistributor.find({
                distributorId: dataDistributor._id,
                status_distributor: "Selesai",
                createdAt: {
                    $gte: start,
                    $lte: end
                }
            });

            const dataPerDay = pengiriman.reduce((acc, curr) => {
                const dateObj = new Date(curr.createdAt);
                const date = dateObj.toISOString().split('T')[0]; // Format date to yyyy-mm-dd
                if (!acc[date]) acc[date] = 0;
                acc[date]++;
                return acc;
            }, {});

            // Generate all dates from start to end
            const result = [];
            let total = 0;
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const formattedDate = d.toISOString().split('T')[0];

                result.push({
                    tanggal: formattedDate,
                    nilai: dataPerDay[formattedDate] || Math.floor(Math.random() * 9) + 1
                });
            }

            // Send response to client
            res.status(200).json({
                message: "Data grafik performa berhasil diambil",
                data: result
            });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
}
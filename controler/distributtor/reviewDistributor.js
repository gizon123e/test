const ReviewDistributor = require('../../models/distributor/model-reviewDistributor')
const Distributtor = require('../../models/distributor/model-distributor')
const PinaltiDistributor = require('../../models/distributor/model-pinaltiDistributor')
const Konsumen = require('../../models/konsumen/model-konsumen')

module.exports = {
    getAllReviewDistributor: async (req, res, next) => {
        try {
            const { nilai_total_review } = req.query
            const datas = await Distributtor.findOne({ userId: req.user.id })
            if (!datas) return res.status(400).json({ message: "data distributor not found" })

            const query = { id_distributor: datas._id }
            if (nilai_total_review) {
                query.nilai_total_review = nilai_total_review
            }

            const dataReview = await ReviewDistributor.find(query).populate('id_distributor').populate('id_konsumen')
                .populate({
                    path: 'id_toko',
                    populate: 'address',
                })
                .populate('id_address').populate('id_jenis_pengiriman')

            res.status(200).json({
                message: "get All review success",
                datas: dataReview
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
    },

    createReviewDistributor: async (req, res, next) => {
        try {
            const { id_distributor, nilai_ketepatan = 0, nilai_komunikasi = 0, id_produk, id_toko, id_address } = req.body

            const dataDistributor = await Distributtor.findOne({ _id: id_distributor })
            if (!dataDistributor) return res.status(404).json({ message: "data Not Found" })

            const dataKonsumen = await Konsumen.findOne({ userId: req.user.id })
            if (!dataKonsumen) return res.status(404).json({ message: "data Konsumen Not Found" })

            const reviewDistributor = await ReviewDistributor.find({ id_distributor: id_distributor })
            const indexReview = reviewDistributor.length + 1

            const getAllPinaltiDistributor = await PinaltiDistributor.find({})
            let hitunganTotalPinalti = 0
            if (getAllPinaltiDistributor) {
                for (let data of getAllPinaltiDistributor) {
                    hitunganTotalPinalti += data.poin_pinalti
                }
            }

            let hitunganPoinReview = 0
            if (reviewDistributor) {
                for (let viewDistributor of reviewDistributor) {
                    const perhitunganPoinTotal = viewDistributor.nilai_ketepatan + viewDistributor.nilai_komunikasi

                    const bagiPerhitungan = perhitunganPoinTotal / 2
                    hitunganPoinReview += bagiPerhitungan
                }
            }

            const perhitunganNilaiPoin = (nilai_ketepatan + nilai_komunikasi) / 2

            let totalPerhitunganPoin
            if (hitunganPoinReview) {
                hitunganPoinReview += perhitunganNilaiPoin

                totalPerhitunganPoin = (hitunganPoinReview - hitunganTotalPinalti) / indexReview
            } else {
                totalPerhitunganPoin = perhitunganNilaiPoin / indexReview
            }

            if (totalPerhitunganPoin < 1) {
                await Distributtor.findOneAndUpdate({ _id: id_distributor }, { nilai_review: 1 }, { new: true })
            } else {
                await Distributtor.findOneAndUpdate({ _id: id_distributor }, { nilai_review: totalPerhitunganPoin }, { new: true })
            }

            const dataReview = await ReviewDistributor.create(
                { id_distributor, nilai_ketepatan, nilai_komunikasi, id_konsumen: dataKonsumen._id, id_produk, id_toko, id_address, nilai_total_review: totalPerhitunganPoin },
            )

            res.status(201).json({
                message: "create data success",
                data: dataReview,
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
    },

    createNonReview: async (req, res, next) => {
        try {
            const { id_distributor, id_produk, id_toko, id_address } = req.body

            const dataDistributor = await Distributtor.findOne({ _id: id_distributor })
            if (!dataDistributor) return res.status(404).json({ message: "data Not Found" })

            const dataKonsumen = await Konsumen.findOne({ userId: req.user.id })
            if (!dataKonsumen) return res.status(404).json({ message: "data Konsumen Not Found" })

            const data = await ReviewDistributor.create({ id_distributor, nilai_ketepatan: 0, nilai_komunikasi: 0, id_konsumen: dataKonsumen._id, id_produk, id_toko, id_address, nilai_total_review: 0 })

            res.status(200).json({
                message: 'create data success',
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
            next(error)
        }
    }
}
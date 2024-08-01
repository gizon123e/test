const ReviewDistributor = require('../../models/distributor/model-reviewDistributor')
const Distributtor = require('../../models/distributor/model-distributor')
const PinaltiDistributor = require('../../models/distributor/model-pinaltiDistributor')

module.exports = {
    getAllReviewDistributor: async (req, res, next) => {
        try {
            const datas = await Distributtor.find()
            if (!datas) return res.status(400).json({ message: "data saat ini masi kosong" })

            res.status(200).json({
                message: "get All review success",
                datas
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
            const { id_distributor, nilai_ketepatan = 0, nilai_komunikasi = 0, id_produk } = req.body

            const dataDistributor = await Distributtor.findOne({ _id: id_distributor })
            if (!dataDistributor) return res.status(404).json({ message: "data Not Found" })

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

            const dataReview = await ReviewDistributor.create({ id_distributor, nilai_ketepatan, nilai_komunikasi, userId: req.user.id, id_produk })

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
    }
}
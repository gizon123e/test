const ReviewProduk = require('../../models/model-review/model-reviewProduk')
const Product = require('../../models/model-product')
const ReviewVendor = require('../../models/vendor/model-reviewVendor')
const ReviewSupplier = require('../../models/supplier/model-reviewSupplier')
const ReviewProdusen = require('../../models/produsen/model-reviewProdusen')
const TokoVendor = require('../../models/vendor/model-toko');
const ReviewDistributor = require('../../models/distributor/model-reviewDistributor')
const path = require('path')
const User = require('../../models/model-auth-user')
const Konsumen = require('../../models/konsumen/model-konsumen')
const PoinHistory = require('../../models/model-poin')
const BiayaTetap = require('../../models/model-biaya-tetap')
const Pengiriman = require('../../models/model-pengiriman')
const TokoSupplier = require('../../models/supplier/model-toko')
const TokoProdusen = require('../../models/produsen/model-toko')
const Orders = require("../../models/pesanan/model-orders");

module.exports = {
    tambahUlasan: async (req, res, next) => {
        try {
            const { komentar_review, nilai_review = 0, id_toko, id_produk, nilai_pengemasan = 0, nilai_kualitas = 0, nilai_keberhasilan = 0, id_konsumen, pengirimanId } = req.body;
            const files = req.files;
            const biayaTetap = await BiayaTetap.findOne({}).lean();
            const images = files ? files.images : [];
            // Memproses image files
            const imagePaths = [];
            if (Array.isArray(images)) {
                for (const image of images) {
                    const namaImage = `${Date.now()}-${image.name}`;
                    const imagePath = path.join(__dirname, '../../public/ulasan-produk', namaImage);
                    await image.mv(imagePath);
                    const urlImage = `${process.env.HOST}/public/ulasan-produk/${namaImage}`;
                    imagePaths.push(urlImage);
                }
            } else if (images) {
                const namaImage = `${Date.now()}-${images.name}`;
                const imagePath = path.join(__dirname, '../../public/ulasan-produk', namaImage);
                await images.mv(imagePath);
                const urlImage = `${process.env.HOST}/public/ulasan-produk/${namaImage}`;
                imagePaths.push(urlImage);
            }
            const datasReviewVendor = await ReviewVendor.find({ id_toko });
            const indexReviewVendor = datasReviewVendor.length + 1;

            let poinVendor = 0;
            if (datasReviewVendor.length > 0) {
                for (let vendorPoin of datasReviewVendor) {
                    const data = parseInt(vendorPoin.nilai_pengemasan) + parseInt(vendorPoin.nilai_kualitas) + parseInt(vendorPoin.nilai_keberhasilan);
                    const bagiData = data / 3;
                    poinVendor += bagiData;
                }
            }
            const hitungVendor = parseInt(nilai_pengemasan) + parseInt(nilai_kualitas) + parseInt(nilai_keberhasilan);
            const bagiVendor = hitungVendor / 3;
            poinVendor += bagiVendor;

            const tokoDetail = await TokoVendor.findOne({ _id: id_toko });
            if (!tokoDetail) return res.status(404).json({ message: "data id_toko Not Found" });

            const totalReviewVendor = (poinVendor - tokoDetail.nilai_pinalti) / indexReviewVendor;

            await ReviewVendor.create({ id_toko, nilai_pengemasan: parseInt(nilai_pengemasan), nilai_kualitas: parseInt(nilai_kualitas), nilai_keberhasilan: parseInt(nilai_keberhasilan), userId: req.user.id, id_produk });

            if (totalReviewVendor < 1) {
                await TokoVendor.findByIdAndUpdate({ _id: id_toko }, { nilai_review: 1, }, { new: true });
            } else {
                await TokoVendor.findByIdAndUpdate({ _id: id_toko }, { nilai_review: totalReviewVendor }, { new: true });
            }

            // Menghitung total review produk
            const reviews = await ReviewProduk.find({ id_produk });
            const indexReviews = reviews.length + 1;

            let nilaiPoin = parseInt(nilai_review);
            if (reviews.length > 0) {
                for (let review of reviews) {
                    nilaiPoin += review.nilai_review;
                }
            }

            let poin_ulasan
            if (komentar_review) {
                const filteredReviews = reviews.filter(review => review.komentar_review && review.komentar_review.trim() !== "")

                poin_ulasan = parseInt(filteredReviews.length) + 1
            } else {
                const filteredReviews = reviews.filter(review => review.komentar_review && review.komentar_review.trim() !== "")

                poin_ulasan = parseInt(filteredReviews.length)
            }

            const totalReviewProduk = nilaiPoin / indexReviews;

            const jumlahKeseluruan = parseInt(nilai_pengemasan) + parseInt(nilai_kualitas) + parseInt(nilai_keberhasilan) + parseInt(nilai_review)
            let nilai_keseluruan = jumlahKeseluruan / 4

            if (nilai_keseluruan < 1) {
                nilai_keseluruan = 1
            }

            // Membuat ulasan baru
            const review = new ReviewProduk({
                id_produk,
                userId: req.user.id,
                komentar_review,
                nilai_review: parseInt(nilai_review),
                images: imagePaths,
                nilai_keseluruan,
                id_konsumen,
                pengirimanId: JSON.parse(pengirimanId),
            });

            // Menyimpan ulasan ke database
            const savedReview = await review.save();

            if (indexReviews > 0) {
                const totalReview = nilaiPoin / indexReviews;
                await Product.findByIdAndUpdate({ _id: id_produk }, {
                    $push: { reviews: savedReview._id },
                    poin_review: totalReview < 1 ? 1 : totalReview,
                    rating: indexReviews,
                    poin_ulasan
                }, { new: true, useFindAndModify: false });
            } else {
                await Product.findByIdAndUpdate({ _id: id_produk }, {
                    $push: { reviews: savedReview._id },
                    poin_review: totalReviewProduk < 1 ? 1 : totalReviewProduk,
                    rating: indexReviews
                }, { new: true, useFindAndModify: false });
            }

            PoinHistory.create({
                userId: req.user.id,
                jenis: "masuk",
                value: biayaTetap.poinPembelian,
                from: [
                    {
                        getFrom: "Review Product"
                    }
                ]
            })
                .then(() => console.log('berhasil mencatat poin history')).catch((e) => console.log("gagal mencatat history poin"))

            res.status(200).json({
                message: "create data review success",
                data: savedReview
            });
        } catch (error) {
            console.log(error);
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                });
            }
            next(error);
        }
    },

    getUlasanByProductId: async (req, res, next) => {
        const { id_produk } = req.params;

        try {
            const reviews = await ReviewProduk.find({ id_produk }).populate("id_konsumen").sort({ createdAt: -1 });
            let toko;
            switch (req.user.role) {
                case "konsumen":
                    toko = await ReviewVendor.find({ id_produk });
                    break;
                case "vendor":
                    toko = await ReviewSupplier.find({ id_produk });
                    break;
                case "supplier":
                    toko = await ReviewProdusen.find({ id_produk });
                    break;
            };
            if (toko.length === 0) return res.status(400).json({ message: `belom ada yang reviews di toko vendor produk id ini ${id_produk}` })
            const nilai_pengemasan = toko.filter(review => review.nilai_pengemasan && review.nilai_pengemasan !== 0)
            const nilai_kualitas = toko.filter(review => review.nilai_kualitas && review.nilai_kualitas !== 0)
            const nilai_keberhasilan = toko.filter(review => review.nilai_keberhasilan && review.nilai_keberhasilan !== 0)

            const distributor = await ReviewDistributor.find({ id_produk })
            const nilai_ketepatan = distributor.filter(review => review.nilai_ketepatan && review.nilai_ketepatan !== 0)
            const nilai_komunikasi = distributor.filter(review => review.nilai_komunikasi && review.nilai_komunikasi !== 0)

            let nilai_review_toko;

            switch (req.user.role) {
                case "konsumen":
                    nilai_review_toko = await TokoVendor.findOne({ _id: toko[0]?.id_toko })
                    break;
                case "vendor":
                    nilai_review_toko = await TokoSupplier.findOne({ _id: toko[0]?.id_toko })
                    break;
                case "supplier":
                    nilai_review_toko = await TokoProdusen.findOne({ _id: toko[0]?.id_toko })
                    break;
            };

            const indexdata = {
                nilai_pengemasan: parseInt(nilai_pengemasan.length),
                nilai_kualitas: parseInt(nilai_kualitas.length),
                nilai_kebersihan: parseInt(nilai_keberhasilan.length),
                nilai_ketepatan: parseInt(nilai_ketepatan.length),
                nilai_komunikasi: parseInt(nilai_komunikasi.length)
            }

            res.status(200).json({
                message: "get all review",
                data: {
                    nilai_review_toko: nilai_review_toko?.nilai_review,
                    indexdata,
                    reviews,
                }
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
            next(error)
        }
    },

    getHistoryReviews: async (req, res, next) => {
        try {
            const user = await Konsumen.findOne({ userId: req.user.id })
            if (!user) return res.status(404).json({ message: "data user tidak di temukan" })

            const reviews = await ReviewProduk.find({ id_konsumen: user._id }).populate("id_konsumen").populate('id_produk').sort({ createdAt: -1 })
            if (reviews.length === 0) return res.status(400).json({ message: 'saat ini kamo belom ada histroy review' })

            res.status(200).json({
                message: "get data success",
                datas: reviews
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

    getHistoryBelomDiReview: async (req, res, next) => {
        try {
            const user = await Konsumen.findOne({ userId: req.user.id })
            if (!user) return res.status(404).json({ message: "data user tidak di temukan" })

            const itemOrder = await Orders.find({ userId: req.user.id, status: "Berhasil" })
            // console.log(itemOrder)

            const pesanan = []

            for (const data of itemOrder) {
                // status_distributor: 'Diterima' 
                const pengiriman = await Pengiriman.findOne({ orderId: data._id.toString() })

                let review
                if (pengiriman) {
                    review = await ReviewProduk.find({ id_konsumen: user._id, pengirimanId: pengiriman._id })
                }

                if (!review) {
                    pesanan.push(data)
                }
            }

            res.status(200).json({
                message: "get data success",
                datas: pesanan
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
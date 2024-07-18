const ReviewProduk = require('../../models/model-review/model-reviewProduk')
const Product = require('../../models/model-product')
const ReviewVendor = require('../../models/vendor/model-reviewVendor')
const TokoVendor = require('../../models/vendor/model-toko')
const path = require('path')

module.exports = {
    tambahUlasan: async (req, res, next) => {
        try {
            const { komentar_review, nilai_review, id_toko, id_produk, nilai_pengemasan, nilai_kualitas, nilai_keberhasilan } = req.body;
            const files = req.files
            const images = files ? files.images : [];
            const video = files ? files.video : null

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

            const videoPaths = []
            if (Array.isArray(video)) {
                for (const vid of video) {
                    const namaVideo = `${Date.now()}-${vid.name}`;
                    const videoPath = path.join(__dirname, '../../public/ulasan-produk', namaVideo);
                    await vid.mv(videoPath);
                    const urlVideo = `${process.env.HOST}/public/ulasan-produk/${namaVideo}`;
                    videoPaths.push(urlVideo);
                }
            } else if (video) {
                const namaVideo = `${Date.now()}-${video.name}`;
                const videoPath = path.join(__dirname, '../../public/ulasan-produk', namaVideo);
                await video.mv(videoPath);
                const urlVideo = `${process.env.HOST}/public/ulasan-produk/${namaVideo}`;
                videoPaths.push(urlVideo);
            }

            const datasReviewVendor = await ReviewVendor.find({ id_toko })
            const indexReviewVendor = datasReviewVendor.length + 1

            let poinVendor = 0
            if (datasReviewVendor) {
                for (let vendorPoin of datasReviewVendor) {
                    const data = parseInt(vendorPoin.nilai_pengemasan) + parseInt(vendorPoin.nilai_kualitas) + parseInt(vendorPoin.nilai_keberhasilan)
                    bagiData = data / 3
                    poinVendor += bagiData
                }
            }
            const hitungVendor = parseInt(nilai_pengemasan) + parseInt(nilai_kualitas) + parseInt(nilai_keberhasilan)
            const bagiVendor = hitungVendor / 3
            poinVendor += bagiVendor

            const tokoDetail = await TokoVendor.findOne({ _id: id_toko })
            if (!tokoDetail) return res.status(404).json({ message: "data id_toko Not Fount" })

            const totalReviewVendor = (poinVendor - tokoDetail.nilai_pinalti) / indexReviewVendor
            console.log(totalReviewVendor)

            await ReviewVendor.create({ id_toko, nilai_pengemasan: parseInt(nilai_pengemasan), nilai_kualitas: parseInt(nilai_kualitas), nilai_keberhasilan: parseInt(videoPaths), userId: req.user.id })

            if (totalReviewVendor < 1) {
                await TokoVendor.findByIdAndUpdate({ _id: id_toko }, { nilai_review: 1 }, { new: true })
            } else {
                await TokoVendor.findByIdAndUpdate({ _id: id_toko }, { nilai_review: totalReviewVendor }, { new: true })
            }

            const reviews = await ReviewProduk.find({ id_produk })
            const indexReviews = reviews.length + 1

            // Membuat ulasan baru
            const review = new ReviewProduk({
                id_produk,
                userId: req.user.id,
                komentar_review,
                nilai_review: parseInt(nilai_review),
                images: imagePaths,
                video: videoPaths
            });

            let nilaiPoin = parseInt(nilai_review)
            if (reviews) {
                for (let vendorPoin of reviews) {
                    nilaiPoin += vendorPoin.nilai_review;
                }
            }
            // Menyimpan ulasan ke database
            const savedReview = await review.save();

            if (indexReviews > 0) {
                const totalReview = nilaiPoin / indexReviews
                if (totalReview < 1) {
                    await Product.findByIdAndUpdate({ _id: id_produk }, {
                        $push: { reviews: savedReview._id },
                        poin_review: 1
                    }, { new: true, useFindAndModify: false })
                } else {
                    await Product.findByIdAndUpdate({ _id: id_produk }, {
                        $push: { reviews: savedReview._id },
                        poin_review: totalReview
                    }, { new: true, useFindAndModify: false })
                }

            } else {
                const totalReview = nilaiPoin / 1
                if (totalReview > 0) {
                    await Product.findByIdAndUpdate({ _id: id_produk }, {
                        $push: { reviews: savedReview._id },
                        poin_review: totalReview
                    }, { new: true, useFindAndModify: false })
                } else {
                    await Product.findByIdAndUpdate({ _id: id_produk }, {
                        $push: { reviews: savedReview._id },
                        poin_review: 1
                    }, { new: true, useFindAndModify: false })
                }
            }

            res.status(200).json({
                message: "create data review success",
                data: savedReview
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

    getUlasanByProductId: async (req, res, next) => {
        const { id_produk } = req.params;

        try {
            const reviews = await ReviewProduk.find({ id_produk }).populate('replies').populate("id_produk");
            res.status(200).json({
                message: "get all review",
                data: reviews
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
    }
}
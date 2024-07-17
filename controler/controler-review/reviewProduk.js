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
            const images = files ? files.images : null
            const video = files ? files.video : null

            const namaVideo = `${Date.now()}${path.extname(video.name)}`
            const videoPath = path.join(__dirname, '../../public/ulasan-produk', namaVideo);

            await video.mv(videoPath);

            const imagePaths = [];
            for (const image of images) {
                const namaImage = `${Date.now()}-${image.name}`;
                const imagePath = path.join(__dirname, '../../public/ulasan-produk', namaImage);
                await image.mv(imagePath);

                const urlImages = `${process.env.HOST}public/ulasan-produk/${namaImage}`
                imagePaths.push(urlImages);
            }

            const datasReviewVendor = await ReviewVendor.find({ id_toko })
            const indexReviewVendor = datasReviewVendor.length + 1

            const tokoDetail = await TokoVendor.findOne({ _id: id_toko })
            if (!tokoDetail) return res.status(404).json({ message: "data id_toko Not Fount" })
            const nilaiReview = nilai_pengemasan + nilai_kualitas + nilai_keberhasilan + tokoDetail.nilai_review
            const bagiReview = nilaiReview / 3
            const totalReviewVendor = (bagiReview - tokoDetail.nilai_pinalti) / indexReviewVendor

            await ReviewVendor.create({ id_toko, nilai_pengemasan, nilai_kualitas, nilai_keberhasilan, userId: req.user.id })

            await TokoVendor.findByIdAndUpdate({ _id: id_toko }, { nilai_review: totalReviewVendor })

            const reviews = await ReviewProduk.find({ id_produk })
            const indexReviews = reviews.length + 1
            // Membuat ulasan baru
            const review = new ReviewProduk({
                id_produk,
                userId: req.user.id,
                komentar_review,
                nilai_review,
                images: imagePaths
            });

            // Menyimpan ulasan ke database
            const savedReview = await review.save();

            // Menambahkan ulasan ke produk terkait
            const product = await Product.findOne({ _id: id_produk });
            const hitungReview = product.poin_review + nilai_review

            if (indexReviews > 0) {
                const totalReview = hitungReview / indexReviews
                console.log(product.poin_review)
                const tes = await Product.findByIdAndUpdate({ _id: id_produk }, {
                    $push: { reviews: savedReview._id },
                    poin_review: totalReview
                }, { new: true, useFindAndModify: false })
                console.log(tes)
            } else {
                const totalReview = hitungReview / 1
                console.log(product.poin_review)
                const tes = await Product.findByIdAndUpdate({ _id: id_produk }, {
                    $push: { reviews: savedReview._id },
                    poin_review: totalReview
                }, { new: true, useFindAndModify: false })
                console.log(tes)
            }

            res.status(200).json({
                message: "",
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
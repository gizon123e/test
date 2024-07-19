const Reply = require('../../models/model-review/model-replayProduk');
const ReviewProduk = require('../../models/model-review/model-reviewProduk');

const tambahBalasan = async (req, res, next) => {
    const { reviewId } = req.params;
    const { komentar_reply } = req.body;

    try {
        // Membuat balasan baru
        const reply = new Reply({
            id_review: reviewId,
            userId: req.user.id,
            komentar_reply
        });

        // Menyimpan balasan ke database
        const savedReply = await reply.save();

        // Menambahkan balasan ke ulasan terkait
        const review = await ReviewProduk.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                message: "Ulasan tidak ditemukan"
            });
        }

        review.replies.push(savedReply._id);
        await review.save();

        res.status(201).json({
            message: "Balasan berhasil ditambahkan",
            data: savedReply
        });
    } catch (error) {
        console.error(error);
        if (error && error.name === 'ValidationError') {
            return res.status(400).json({
                error: true,
                message: error.message,
                fields: error.errors
            });
        }
        next(error);
    }
};

const getBalasanByReviewId = async (req, res) => {
    const { reviewId } = req.params;

    try {
        const replies = await Reply.find({ id_review: reviewId });
        res.status(200).json({
            message: "get all data Replay success",
            datas: replies
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    tambahBalasan,
    getBalasanByReviewId
};

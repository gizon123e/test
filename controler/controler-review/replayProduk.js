const ReviewProduk = require('../../models/model-review/model-reviewProduk');
const Reply = require('../../models/model-review/model-replayProduk');

const tambahBalasan = async (req, res) => {
    const { reviewId } = req.params;
    const { userId, komentar_reply } = req.body;

    try {
        // Membuat balasan baru
        const reply = new Reply({
            id_review: reviewId,
            userId,
            komentar_reply
        });

        // Menyimpan balasan ke database
        const savedReply = await reply.save();

        // Menambahkan balasan ke ulasan terkait
        const review = await ReviewProduk.findById(reviewId);
        review.replies.push(savedReply._id);
        await review.save();

        res.status(200).json(savedReply);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBalasanByReviewId = async (req, res) => {
    const { reviewId } = req.params;

    try {
        const review = await ReviewProduk.findById(reviewId).populate('replies');
        res.status(200).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    tambahBalasan,
    getBalasanByReviewId
};

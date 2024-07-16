const router = require('express').Router();
const replyController = require('../../controler/controler-review/replayProduk');

// Mendapatkan ulasan dan balasan
router.get('/:reviewId', replyController.getBalasanByReviewId)
// Tambah balasan
router.post('/:reviewId/reply', replyController.tambahBalasan)

module.exports = router;

const router = require('express').Router()
const authorization = require("../../midelware/authorization");
const replyController = require('../../controler/controler-review/replayProduk')

router.get('/reply/:reviewId', replyController.getBalasanByReviewId)
router.post('/reply/:reviewId', authorization, replyController.tambahBalasan)

module.exports = router;

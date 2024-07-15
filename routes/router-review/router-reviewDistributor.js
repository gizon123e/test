const router = require('express').Router()
const authorization = require("../../midelware/authorization");
const controlerReviewDistributor = require('../../controler/controler-review/reviewDistributor')

router.get('/list', controlerReviewDistributor.getAllReviewDistributor)
router.post('/create', authorization, controlerReviewDistributor.createReviewDistributor)

module.exports = router
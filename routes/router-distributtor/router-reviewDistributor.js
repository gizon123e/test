const router = require('express').Router()
const authorization = require("../../midelware/authorization");
const controlerReviewDistributor = require('../../controler/distributtor/reviewDistributor')

router.get('/list', authorization, controlerReviewDistributor.getAllReviewDistributor)
router.post('/create', authorization, controlerReviewDistributor.createReviewDistributor)
router.post('/tidak-review', authorization, controlerReviewDistributor.createNonReview)

module.exports = router
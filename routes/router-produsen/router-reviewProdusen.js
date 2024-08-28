const router = require('express').Router()
const authorization = require("../../midelware/authorization");
const controlerReviewProdusen = require('../../controler/produsen/reviewProdusen')

router.get('/list', authorization, controlerReviewProdusen.getReviewUlasanProdusen)

module.exports = router
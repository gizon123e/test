const router = require('express').Router()
const authorization = require("../../midelware/authorization");
const controlerReviewVendor = require('../../controler/vendor/reviewVendor')

router.get('/list', authorization, controlerReviewVendor.getReviewUlasanVendor)

module.exports = router
const router = require('express').Router()
const authorization = require("../../midelware/authorization");
const controlerReviewVendor = require('../../controler/vendor/reviewVendor')

router.get('/list', controlerReviewVendor.getAllReviewKonsumen)
router.post('/create', controlerReviewVendor.createDataReviewKonsumen)

module.exports = router
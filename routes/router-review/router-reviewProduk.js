const router = require('express').Router()
const authorization = require("../../midelware/authorization");
const reviewProdukController = require('../../controler/controler-review/reviewProduk')

router.post('/reviews', authorization, reviewProdukController.tambahUlasan);
router.get('/reviews', reviewProdukController.getUlasanByProductId);

module.exports = router
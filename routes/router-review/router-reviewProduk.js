const router = require('express').Router()
const authorization = require("../../midelware/authorization");
const reviewProdukController = require('../../controler/controler-review/reviewProduk')

router.post('/reviews', authorization, reviewProdukController.tambahUlasan);
router.get('/reviews/:id_produk', authorization, reviewProdukController.getUlasanByProductId);
router.get('/history', authorization, reviewProdukController.getHistoryReviews)
router.get('/belom-dinilai', authorization, reviewProdukController.getHistoryBelomDiReview)

module.exports = router
const router = require('express').Router()
const authorization = require("../../midelware/authorization");
const reviewProdukController = require('../../controler/controler-review/reviewProduk')

router.post('/reviews/:id_produk', authorization, reviewProdukController.tambahUlasan);
router.get('/reviews/:id_produk', reviewProdukController.getUlasanByProductId);

module.exports = router
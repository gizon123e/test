const router = require('express').Router()

const reviewProdukController = require('../../controler/controler-review/reviewProduk')

router.post('/:id_produk/review', reviewProdukController.tambahUlasan);
router.get('/:id_produk/reviews', reviewProdukController.getUlasanByProductId);

module.exports = router
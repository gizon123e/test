const router = require("express").Router();
const controllerFlashSale = require('../controler/flash-sale')

router.get('/list', controllerFlashSale.getFlashSale);
router.post('/add', controllerFlashSale.addFlashSale);

module.exports = router
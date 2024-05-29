const router = require("express").Router();
const controllerFlashSale = require("../controler/flash-sale");

router.get("/list", controllerFlashSale.getFlashSale);
router.get("/list/admin", controllerFlashSale.getFlashSaleAdmin);
router.post("/add", controllerFlashSale.addFlashSale);
router.delete("/delete/:id", controllerFlashSale.deleteFlashSale);

module.exports = router;

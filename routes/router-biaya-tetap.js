const router = require('express').Router()
const controller = require("../controler/biaya-tetap")

router.get("/list", controller.getBiayaTetap);
router.put('/edit', controller.editBiayaTetap);

module.exports = router
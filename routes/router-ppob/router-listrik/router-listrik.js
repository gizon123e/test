const controller = require('../../../controler/ppob/listrik/listrik')

const router = require('express').Router()

router.get("/search", controller.searchMeterId);
router.get("/besaran", controller.getBesaranKwh);

module.exports = router
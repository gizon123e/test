const controller = require('../../../controler/ppob/listrik/listrik')

const router = require('express').Router()

router.get("/search", controller.searchMeterId);
module.exports = router
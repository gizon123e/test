const controller = require('../../../controler/ppob/data/data')

const router = require('express').Router()

router.get("/list", controller.getAllData);

module.exports = router
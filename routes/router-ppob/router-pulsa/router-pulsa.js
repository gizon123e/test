const controller = require('../../../controler/ppob/pulsa/pulsa')

const router = require('express').Router()

router.get("/list", controller.getAllPulsa);

module.exports = router
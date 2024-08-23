const router = require('express').Router()
const controller = require("../../controler/forget-credentials/pin")

router.get("/", controller.forgot_pin);

module.exports = router
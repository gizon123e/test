const router = require('express').Router()
const controller = require("../../controler/forget-credentials/pin")

router.post("/", controller.forgot_pin);

module.exports = router
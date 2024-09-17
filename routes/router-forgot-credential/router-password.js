const router = require('express').Router()
const controller = require("../../controler/forget-credentials/password")

router.post("/", controller.forgot_password);

module.exports = router
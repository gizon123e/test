const router = require('express').Router()
const controller = require("../../controler/forget-credentials/password")

router.get("/", controller.forgot_password);

module.exports = router
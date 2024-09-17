const router = require("express").Router();
const controllerResend = require("../controler/sendOtp");

router.post('/', controllerResend.sendOtp);

module.exports = router
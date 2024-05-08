const router = require('express').Router()
const controllerOtp = require('../controler/verify');
const emptyData = require('../midelware/emptyData')

router.post('/register', emptyData, controllerOtp.verifyOtpRegister);
router.post('/login', emptyData, controllerOtp.verifyOtpLogin)

module.exports = router
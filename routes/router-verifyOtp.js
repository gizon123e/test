const router = require('express').Router()
const controllerOtp = require('../controler/verify');

router.post('/register', controllerOtp.verifyOtpRegister);
router.post('/login', controllerOtp.verifyOtpLogin)

module.exports = router
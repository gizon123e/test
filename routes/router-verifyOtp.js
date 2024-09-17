const router = require('express').Router()
const controllerOtp = require('../controler/verify');
const emptyData = require('../midelware/emptyData')

router.post('/register', emptyData, controllerOtp.verifyOtpRegister);
router.post('/delete', emptyData, controllerOtp.deleteAccount);
router.post('/login', emptyData, controllerOtp.verifyOtpLogin);
router.post('/reset-credentials', emptyData, controllerOtp.verifyResetCredentials);

module.exports = router
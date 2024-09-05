const passport = require("../utils/passportRegister");
const router = require('express').Router();
const userAuthController = require("../controler/user/auth-user")

router.get('/', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/success', passport.authenticate('google', { failureRedirect: '/failed'}) , userAuthController.successRegisterWithEmail);

module.exports = router;
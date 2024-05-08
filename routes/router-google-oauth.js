const passport = require("../utils/passport");
const router = require('express').Router();
const userAuthController = require("../controler/auth-user")

router.get('/', passport.authenticate('google', { scope: ['profile'] }));
router.get('/success', passport.authenticate('google', { failureRedirect: '/failed'}) , userAuthController.successLoginWithEmail);

module.exports = router;
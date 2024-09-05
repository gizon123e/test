const passport = require("../utils/passportLogin");
const router = require('express').Router();
const userAuthController = require("../controler/user/auth-user");

router.get('/', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/success', passport.authenticate('google', { failureRedirect: '/failed'}) , userAuthController.successLoginWithEmail);

module.exports = router;
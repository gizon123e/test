// import midelware authorization
const authorization = require("../midelware/authorization");

// import controler
const controlerAuthUser = require("../controler/auth-user");

const router = require("express").Router();

// router auth user
router.post("/login", controlerAuthUser.login);
router.post("/register", controlerAuthUser.register);


module.exports = router;

<<<<<<< HEAD
// import midelware authorization
const authorization = require("../midelware/authorization");

// import controler
const controlerAuthUser = require("../controler/auth-user");

const router = require("express").Router();

// router auth user
router.post("/login", controlerAuthUser.login);
router.post("/register", controlerAuthUser.register);


module.exports = router;
=======
// import midelware authorization
const authorization = require("../midelware/authorization");

// import controler
const controlerAuthUser = require("../controler/auth-user");

const router = require("express").Router();

// router auth user
router.post("/login", controlerAuthUser.login);
router.post("/register", controlerAuthUser.register);


module.exports = router;
>>>>>>> b5a31a26557174393446f828752b57d536e79998

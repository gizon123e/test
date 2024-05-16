// import midelware authorization
const authorization = require("../midelware/authorization");

// import controler
const controlerAuthUser = require("../controler/auth-user");

const router = require("express").Router();

// router auth user
router.post("/login", controlerAuthUser.login);
router.post("/register", controlerAuthUser.register);
router.post("/check-verified", controlerAuthUser.validateUser);
router.post("/add-pin", authorization, controlerAuthUser.addPin);
router.post("/register/send_otp_email", controlerAuthUser.sendOtpWithEmail);
router.post("/register/send_otp_phone", controlerAuthUser.sendOtpWithPhone);
router.post("/check-pin", authorization, controlerAuthUser.verifyPin);
router.put("/update", authorization, controlerAuthUser.editUser);
router.put("/edit-pin", authorization, controlerAuthUser.editPin);

module.exports = router;

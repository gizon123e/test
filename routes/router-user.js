// import midelware authorization
const authorization = require("../midelware/authorization");

// import controler
const controlerAuthUser = require("../controler/auth-user");

const router = require("express").Router();

// router auth user
router.post("/login", controlerAuthUser.login);
router.post("/register", controlerAuthUser.register);
router.post("/check-verified", controlerAuthUser.validateUser);
router.post("/add-pin", authorization, controlerAuthUser.addPinForPhoneAccount);
router.post("/register/send_otp_email", controlerAuthUser.sendOtpWithEmail);
router.post("/register/send_otp_phone", controlerAuthUser.sendOtpWithPhone);
router.put("/update", authorization, controlerAuthUser.editUser);

module.exports = router;

// import midelware authorization
const authorization = require("../midelware/authorization");

// import controler
const controlerAuthUser = require("../controler/user/auth-user");
const controlerActivities = require("../controler/user/aktivitas-login");


const router = require("express").Router();

// router auth user
router.get('/check-token', controlerAuthUser.checkToken);
router.get("/check-verified-detail", authorization, controlerAuthUser.validateDetail);
router.get("/delete-account-validation", authorization, controlerAuthUser.deleteAccountCheck);
router.get("/login-activities", authorization, controlerActivities.getAktivitasLogin);
router.post("/login", controlerAuthUser.login);
router.post("/reset-password" , controlerAuthUser.resetPassword);
router.post("/reset-pin" , controlerAuthUser.resetPin);
router.post("/register", controlerAuthUser.register);
router.post('/check-duplicate', controlerAuthUser.chekDuplicateNumberOrEmail);
router.post("/check-verified", controlerAuthUser.validateUser);
router.post("/add-pin", authorization, controlerAuthUser.addPin);
router.post("/register/send_otp_email", controlerAuthUser.sendOtpWithEmail);
router.post("/register/send_otp_phone", controlerAuthUser.sendOtpWithPhone);
router.post("/check-pin", authorization, controlerAuthUser.verifyPin);
router.post("/check-password", authorization, controlerAuthUser.verifyPassword);
router.post("/delete-account-request", authorization, controlerAuthUser.requestDeleteAccount);
router.put("/update", authorization, controlerAuthUser.editUser);
router.put("/edit-pin", authorization, controlerAuthUser.editPin);
router.put("/edit-password", authorization, controlerAuthUser.editPassword);
router.delete("/delete-device", authorization, controlerActivities.deleteDeviceLogin);

module.exports = router;

const router = require("express").Router();
const systemUser = require("../controler/auth-system-user")
const authorization = require("../midelware/authorization")

router.get("/getAll", authorization, systemUser.getAllUser);
router.put("/edit/:id", authorization, systemUser.editUser);
router.put('/verify-or-block/:id', authorization, systemUser.verifyOrBlockUser);
router.post("/login", systemUser.login);
router.delete("/delete/:id", authorization, systemUser.deleteUser)

module.exports = router;
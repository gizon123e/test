const router = require("express").Router();
const systemUser = require("../controler/auth-system-user")
const authorization = require("../midelware/authorization")

router.get("/getAll", authorization, systemUser.getAllUser);
router.put("/edit/:id", authorization, systemUser.editUser);
router.post("/login", systemUser.login),

module.exports = router;
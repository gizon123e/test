const router = require("express").Router();
const systemUser = require("../controler/auth-system-user").login

router.post("/", systemUser)

module.exports = router;
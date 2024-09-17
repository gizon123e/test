const router = require("express").Router();
const controller = require("../controler/poin")
const auth = require("../midelware/authorization")

router.get("/history", auth, controller.getPoinHistory);

module.exports = router
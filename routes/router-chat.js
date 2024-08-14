const controller = require('../controler/chat');
const router = require("express").Router();
const authorization = require("../midelware/authorization")
router.get("/list", authorization, controller.getAllChat)
router.get("/detail/:id", authorization, controller.getDetailChat);

module.exports = router
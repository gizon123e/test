const router = require("express").Router();
const authorization = require("../midelware/authorization");
const controller = require('../controler/payMethod');
router.get('/', authorization, controller.getPayMethod);

module.exports = router
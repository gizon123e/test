const router = require('express').Router()
const authorization = require('../midelware/authorization');
const promoController = require("../controler/promo");

router.post("/addPromo", authorization, promoController.addPromo);

module.exports = router
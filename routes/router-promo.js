const router = require('express').Router()
const authorization = require('../midelware/authorization');
const promoController = require("../controler/promo");

router.post("/addPromo", authorization, promoController.addPromo);
router.get('/listPromo', authorization, promoController.getPromo)

module.exports = router
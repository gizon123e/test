// import midelware
const authorization = require("../midelware/authorization");

//controller
const controllerPayment = require('../controler/payment');

const router = require('express').Router();

router.get('/get_payment', authorization, controllerPayment.getPayment);
router.get('/status_payment', authorization, controllerPayment.statusPayment);

module.exports = router;
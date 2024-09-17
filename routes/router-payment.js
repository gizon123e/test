// import midelware
const authorization = require("../midelware/authorization");

//controller
const controllerPayment = require('../controler/payment');

const router = require('express').Router();

router.post('/web_hook_midtrans', controllerPayment.midtransWebHook);
router.post('/invoice/pay', controllerPayment.bayarInvoice)
router.get('/status_payment/:id', authorization, controllerPayment.statusPayment);

module.exports = router;
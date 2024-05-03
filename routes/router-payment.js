// import midelware
const authorization = require("../midelware/authorization");

// controler address
const controllerPayment = require('../controler/payment');

const router = require('express').Router();

router.get('/get_payment', authorization, controllerPayment.getPayment);
router.get('/status_payment', authorization, controllerPayment.statusPayment);
// router.post('/create', authorization, controllerPayment.createAddress)
// router.put('/update/:id', authorization, emptyData, controllerPayment.updateAddress)
// router.delete('/delete/:id', authorization, controllerPayment.deleteAddress)

module.exports = router
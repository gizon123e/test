// import midelware authorization
const authorization = require("../midelware/authorization");

// controler distributtor
const controlerOrderDistributtor = require('../controler/distributtor/orderDistributtor')

const router = require('express').Router()

router.get('/list', authorization, controlerOrderDistributtor.getAllOrderDistributtor)
router.post('/create', authorization, controlerOrderDistributtor.createOrderDistributtor)
router.put('/update/:id', authorization, controlerOrderDistributtor.updateOrderDistributtor)
router.delete('/delete/:id', authorization, controlerOrderDistributtor.deleteOrderDistributtor)

module.exports = router
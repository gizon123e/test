// import midelware authorization
const authorization = require("../midelware/authorization");

// import controler Order
const controlerOrder = require('../controler/orders')

const router = require('express').Router()

router.get('/list', authorization, controlerOrder.getOrders)
router.post('/create', authorization, controlerOrder.createOrder)
router.delete('/delete/:id', authorization, controlerOrder.deleteOrder)

module.exports = router
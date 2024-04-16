// import midelware
const authorization = require("../midelware/authorization");
const roleClasification = require("../midelware/user-role-clasification")
const emptyData = require('../midelware/emptyData')
// import controler Order
const controlerOrder = require('../controler/orders')

const router = require('express').Router()

router.get('/list', authorization, controlerOrder.getOrders)
router.post('/create', authorization, controlerOrder.createOrder)
router.put("/update_status", authorization, emptyData, controlerOrder.update_status)
router.delete('/delete/:id', authorization, controlerOrder.deleteOrder)

module.exports = router
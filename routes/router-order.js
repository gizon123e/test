// import midelware
const authorization = require("../midelware/authorization");
const notEmptyDetailData = require("../midelware/detail-data-check");
const emptyData = require('../midelware/emptyData');
// import controler Order
const controlerOrder = require('../controler/orders');

const router = require('express').Router()

router.get('/list-order-panel', controlerOrder.getOrderPanel)
router.get('/list', authorization, controlerOrder.getOrders)
router.get('/detail/:id', authorization, controlerOrder.getOrderDetail);
router.post('/create', authorization, notEmptyDetailData, controlerOrder.createOrder)
router.put("/update_status", authorization, emptyData, controlerOrder.update_status)
router.delete('/delete/:id', authorization, controlerOrder.deleteOrder)

module.exports = router
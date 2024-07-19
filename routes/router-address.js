// import midelware
const authorization = require("../midelware/authorization");
const emptyData = require('../midelware/emptyData')

// controler address
const controlerAddress = require('../controler/address')

const router = require('express').Router()

router.get('/list', authorization, controlerAddress.getAddress);
router.get("/detail/:id", authorization, controlerAddress.getDetailAddress);
router.post('/create', authorization, controlerAddress.createAddress)
router.put('/update/:id', authorization, emptyData, controlerAddress.updateAddress)
router.delete('/delete/:id', authorization, controlerAddress.deleteAddress)

module.exports = router
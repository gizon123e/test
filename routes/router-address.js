// import midelware authorization
const authorization = require("../midelware/authorization");

// controler address
const controlerAddress = require('../controler/address')

const router = require('express').Router()

router.get('/list', authorization, controlerAddress.getAddress)
router.post('/create', authorization, controlerAddress.createAddress)
router.put('/update/:id', authorization, controlerAddress.updateAddress)
router.delete('/delete/:id', authorization, controlerAddress.deleteAddress)

module.exports = router
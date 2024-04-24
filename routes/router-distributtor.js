// import midelware authorization
const authorization = require("../midelware/authorization");

// controler distributtor
const controlerDistributtor = require('../controler/distributtor/distributtor')

const router = require('express').Router()

router.get('/list', authorization, controlerDistributtor.getAllDistributtor)
router.get('/detail/:id', authorization, controlerDistributtor.getDetailDistributtor)
router.post('/create', authorization, controlerDistributtor.createDistributtor)
router.put('/update/:id', authorization, controlerDistributtor.updateDistributtor)
router.delete('/delete/:id', authorization, controlerDistributtor.deleteDistributtor)

module.exports = router
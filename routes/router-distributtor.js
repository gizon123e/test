// import middleware
const authorization = require("../midelware/authorization");
const fileType = require("../midelware/file-type-middleware")

// controler distributtor
const controlerDistributtor = require('../controler/distributtor/distributtor')

const router = require('express').Router()

router.get('/list', authorization, controlerDistributtor.getAllDistributtor)
router.get('/detail', authorization, controlerDistributtor.getDetailDistributtor)
router.post('/create', authorization, fileType, controlerDistributtor.createDistributtor)
router.put('/update/:id', authorization, fileType, controlerDistributtor.updateDistributtor)
router.delete('/delete/:id', authorization, controlerDistributtor.deleteDistributtor)

module.exports = router
// import midelware authorization
const authorization = require("../../midelware/authorization");

// controler distributtor
const contrlerDocumentDistributtor = require("../../controler/distributtor/documentDistributtor")

const router = require('express').Router()

router.get('/list', contrlerDocumentDistributtor.getDataDocumentDistributtor)
router.get('/detail/:id', contrlerDocumentDistributtor.getDataDocumentDistributtorById)
router.post('/create', contrlerDocumentDistributtor.createDocumentDistributtor)
router.put('/update/:id', contrlerDocumentDistributtor.updateDocumentDistributtor)
router.delete('/delete/:id', contrlerDocumentDistributtor.deleteDocumentDistributtor)

module.exports = router
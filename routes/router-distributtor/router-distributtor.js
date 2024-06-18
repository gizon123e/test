// import middleware
const authorization = require("../../midelware/authorization");
const fileType = require("../../midelware/file-type-middleware")

// controler distributtor
const controlerDistributtor = require('../../controler/distributtor/distributtor')

const router = require('express').Router()

router.post('/list/:id', authorization, controlerDistributtor.getAllDistributtor)
router.get('/detail/:id', controlerDistributtor.getDetailDistributtor)
router.post('/harga-terendah/:id', authorization, controlerDistributtor.getDistributtorCariHargaTerenda)
router.post('/create', controlerDistributtor.createDistributtor)
router.put('/update/:id', controlerDistributtor.updateDistributtor)
router.delete('/delete/:id', controlerDistributtor.deleteDistributtor)

module.exports = router
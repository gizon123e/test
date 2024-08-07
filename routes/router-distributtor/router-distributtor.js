// import middleware
const authorization = require("../../midelware/authorization");

// controler distributtor
const controlerDistributtor = require('../../controler/distributtor/distributtor')

const router = require('express').Router()

router.get('/detail', authorization, controlerDistributtor.getProfileDistributor)
router.get('/detail/:id', controlerDistributtor.getDetailDistributtor)
router.post('/list/:id', authorization, controlerDistributtor.getAllDistributtor)
router.post('/harga-terendah/:id', authorization, controlerDistributtor.getDistributtorCariHargaTerenda)
router.post('/pencarian-ulang/:id', authorization, controlerDistributtor.getAllPencarianUlangDistributor)
router.post('/create', controlerDistributtor.createDistributtor)
router.put('/update', authorization, controlerDistributtor.updateDistributtor)
router.delete('/delete/:id', controlerDistributtor.deleteDistributtor)

module.exports = router
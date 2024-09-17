const router = require('express').Router()

const controlerRekeningDistributor = require('../../controler/distributtor/rekening-distributor')

router.get('/list/:id', controlerRekeningDistributor.getAllRekeningDistributor)
router.post('/create', controlerRekeningDistributor.createRekeningDistributor)
router.put('/update/:id', controlerRekeningDistributor.updateRekeningDistributor)

module.exports = router
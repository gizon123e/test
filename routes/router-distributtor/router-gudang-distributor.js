const router = require('express').Router()

const controlerDistributor = require('../../controler/distributtor/gudangDistributor')

router.get('/list', controlerDistributor.getAllGudangDistributor)
router.post('/create', controlerDistributor.createGudangPengiriman)

module.exports = router
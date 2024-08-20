const router = require('express').Router()
const authorization = require("../../midelware/authorization");

const controlerPengemudi = require('../../controler/distributtor/pengemudi')

router.get('/list', authorization, controlerPengemudi.getPengemudiList)
router.get('/detail/:id', controlerPengemudi.getPengemudiDetail)
router.get('/pencarian-pengemudi/:id', authorization, controlerPengemudi.getAllPengemudiProsesPengiriman)
router.post('/create', controlerPengemudi.createPengemudi)
router.put('/update/:id', controlerPengemudi.updatePengemudiDistributor)
router.put('/update-status/:id', controlerPengemudi.updateStatusPengemudi)

module.exports = router
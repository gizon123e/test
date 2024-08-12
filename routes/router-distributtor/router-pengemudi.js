const router = require('express').Router()
const authorization = require("../../midelware/authorization");

const controlerPengemudi = require('../../controler/distributtor/pengemudi')

router.get('/list', authorization, controlerPengemudi.getPengemudiList)
router.get('/detail/:id', controlerPengemudi.getPengemudiDetail)
router.get('/veriifikasi/:id', controlerPengemudi.updateVerifikasi)
router.get('/pencarian-pengemudi/:id', authorization, controlerPengemudi.getAllPengemudiProsesPengiriman)
router.post('/create', controlerPengemudi.createPengemudi)
router.put('/update/:id', controlerPengemudi.updatePengemudiDistributor)
router.put('/tolak/:id', controlerPengemudi.tolakPengemudi)

module.exports = router
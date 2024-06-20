const router = require('express').Router()
const authorization = require("../../midelware/authorization");

const controlerPengemudi = require('../../controler/distributtor/pengemudi')

router.get('/list', controlerPengemudi.getPengemudiList)
router.get('/detail/:id', controlerPengemudi.getPengemudiDetail)
router.get('/veriifikasi/:id', controlerPengemudi.updateVerifikasi)
router.put('/tolak/:id', controlerPengemudi.tolakPengemudi)

module.exports = router
const router = require('express').Router()
const authorization = require("../../midelware/authorization");

const controlerPengemudi = require('../../controler/distributtor/pengemudi')

router.get('/list', controlerPengemudi.getPengemudiList)
router.get('/detail/:id', controlerPengemudi.getPengemudiDetail)

module.exports = router
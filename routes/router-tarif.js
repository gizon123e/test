const router = require('express').Router()

const controlerTaif = require('../controler/controler-tarif')

router.get('/list', controlerTaif.getListTarif)
router.get('/detail/:id', controlerTaif.getByIdTrif)
router.post('/create', controlerTaif.createTarif)

module.exports = router
const router = require('express').Router()

const controlerTaif = require('../controler/controler-tarif')

router.get('/list', controlerTaif.getListTarif)
router.get('/detail/:id', controlerTaif.getByIdTrif)
router.post('/create', controlerTaif.createTarif)
router.put('/update/:id', controlerTaif.updateTarif)
router.delete('/delete/:id', controlerTaif.deleteTarif)

module.exports = router
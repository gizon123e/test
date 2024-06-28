const router = require('express').Router()

const controlerTypeKendaraan = require('../../controler/distributtor/typeKendaraan')

router.get('/list', controlerTypeKendaraan.getAllTypeKendaraan)
router.post('/create', controlerTypeKendaraan.createTypeKendaraan)
router.put('/update/:id', controlerTypeKendaraan.updateTypeKendaraan)
router.delete('/delete/:id', controlerTypeKendaraan.deletTypeKendaraan)

module.exports = router
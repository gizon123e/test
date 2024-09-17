const router = require("express").Router()

const controlerJenisKendaraan = require('../../controler/distributtor/jenisKendaraan')

router.get("/list", controlerJenisKendaraan.getAllKendaraan)
router.post('/create', controlerJenisKendaraan.createKendaraan)
router.put('/update/:id', controlerJenisKendaraan.updateKendaraan)
router.delete('/delete/:id', controlerJenisKendaraan.deleteKendaraan)

module.exports = router
const router = require("express").Router()

const controleMerkKendaraan = require("../../controler/distributtor/merkKendaraan")

router.get('/list', controleMerkKendaraan.allKendaraan)
router.post('/create', controleMerkKendaraan.createKendaraan)
router.put('/update/:id', controleMerkKendaraan.updateKendaraan)
router.delete('/delete/:id', controleMerkKendaraan.deleteKendaraan)

module.exports = router
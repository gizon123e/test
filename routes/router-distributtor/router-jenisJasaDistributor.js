const router = require('express').Router()

const controlerJasaDistributor = require("../../controler/distributtor/jenisJasaDistributor")

router.get("/list", controlerJasaDistributor.getAllJenisJasaDistributor)
router.post("/create", controlerJasaDistributor.createJenisJasaDistributor)
router.put('/update/:id', controlerJasaDistributor.updateJenisJasaDistributor)

module.exports = router
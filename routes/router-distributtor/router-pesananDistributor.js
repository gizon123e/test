const router = require("express").Router()

const controlerPesananDistributor = require('../../controler/distributtor/pesananDistributor')

router.get("/list", controlerPesananDistributor.getAllPesananDistributor)
router.get("/detail/:id", controlerPesananDistributor.getPesananDistributorById)
router.post('/create', controlerPesananDistributor.createPesananDistributor)
router.put("/update/:id", controlerPesananDistributor.updatePesananDistributor)
router.delete("/delete/:id", controlerPesananDistributor.deletePesananDistributor)

module.exports = router


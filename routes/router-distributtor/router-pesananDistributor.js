const router = require("express").Router()
const authorization = require('../../midelware/authorization')
const controlerPesananDistributor = require('../../controler/distributtor/pesananDistributor')

router.get("/list/:id", authorization, controlerPesananDistributor.getAllPesananDistributor)
router.get('/detail/:id', authorization, controlerPesananDistributor.getByIdPengirimanDistributor)
router.put("/ubah-status/:id", authorization, controlerPesananDistributor.ubahStatus)
router.put('/terima', controlerPesananDistributor.updateDiTerimaDistributor)

module.exports = router


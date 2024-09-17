const router = require("express").Router()
const authorization = require('../../midelware/authorization')
const controlerPesananDistributor = require('../../controler/distributtor/pesananDistributor')

router.get("/list/:id", controlerPesananDistributor.getAllPesananDistributor)
router.put("/ubah-status/:id", authorization, controlerPesananDistributor.ubahStatus)
router.get('/terima/:id', controlerPesananDistributor.updateDiTerimaDistributor)

module.exports = router


const router = require("express").Router()
const authorization = require('../../midelware/authorization')
const controlerPesananDistributor = require('../../controler/distributtor/pesananDistributor')
const controllerPengiriman = require('../../controler/distributtor/pengiriman')

router.get("/list/:id", authorization, controlerPesananDistributor.getAllPesananDistributor);
router.get('/detail/:id', authorization, controlerPesananDistributor.getByIdPengirimanDistributor);
router.put("/request-pickup/:id", authorization, controllerPengiriman.requestPickUp);
router.get('/terima/:id', controlerPesananDistributor.updateDiTerimaDistributor);

module.exports = router


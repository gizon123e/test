const router = require("express").Router()
const authorization = require('../../midelware/authorization')
const controlerPesananDistributor = require('../../controler/distributtor/pesananDistributor')
const controllerPengiriman = require('../../controler/distributtor/pengiriman')

router.get("/list/:id", authorization, controlerPesananDistributor.getAllPesananDistributor);
router.get('/detail/:id', authorization, controlerPesananDistributor.getByIdPengirimanDistributor);
router.put("/request-pickup", authorization, controllerPengiriman.requestPickUp);
router.put('/terima', controlerPesananDistributor.updateDiTerimaDistributor);

module.exports = router


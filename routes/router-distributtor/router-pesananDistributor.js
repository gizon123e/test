const router = require("express").Router()
const authorization = require('../../midelware/authorization')
const controlerPesananDistributor = require('../../controler/distributtor/pesananDistributor');
const controllerPenghasilan = require('../../controler/distributtor/penghasilan')
const controllerPengiriman = require('../../controler/distributtor/pengiriman')

router.get("/list/:id", authorization, controlerPesananDistributor.getAllPesananDistributor);
router.get('/detail/:id', authorization, controlerPesananDistributor.getByIdPengirimanDistributor);
router.get('/penghasilan', authorization, controllerPenghasilan.getPenghasilan);
router.put("/request-pickup/:id", authorization, controllerPengiriman.requestPickUp);
router.put('/terima', controlerPesananDistributor.updateDiTerimaDistributor);
router.put('/pencarian-ulang', authorization, controllerPengiriman.createPencarianUlangDistributor);

module.exports = router


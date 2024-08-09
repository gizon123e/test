const router = require('express').Router()

const { getTrekingDistributor } = require('../../controler/konsumen/pelacakanDistributorKonsumen')

router.get('/lacak/:id_toko/:id_distributor/:pengirimanId', getTrekingDistributor)

module.exports = router
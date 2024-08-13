const router = require('express').Router()
const authorization = require('../../midelware/authorization')
const { getTrekingDistributor } = require('../../controler/konsumen/pelacakanDistributorKonsumen')

router.get('/lacak/:id_toko/:id_distributor/:pengirimanId/:id_sekolah', authorization, getTrekingDistributor)

module.exports = router
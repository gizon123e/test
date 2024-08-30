const router = require('express').Router()
const authorization = require('../../midelware/authorization')
const { getTrekingDistributor, getDetailLacakanDistributor, lacakLokasiDitributor } = require('../../controler/konsumen/pelacakanDistributorKonsumen')

router.get('/lacak/:id_toko/:id_distributor/:pengirimanId/:id_sekolah', authorization, getTrekingDistributor)
router.get('/lacak/:id', getDetailLacakanDistributor)
router.put('/lacak', lacakLokasiDitributor)

module.exports = router
// import middleware
const authorization = require("../../midelware/authorization");
const fileType = require("../../midelware/file-type-middleware")

// controler distributtor
const controlerKendaraanDistributtor = require('../../controler/distributtor/kendaraanDistributtor')

const router = require('express').Router()

router.get('/list', authorization, controlerKendaraanDistributtor.getKendaraanDistributor)
router.get('/panel/:id', controlerKendaraanDistributtor.getKendaraanDistributorDetailPanel)
router.get('/verifikasi/:id', controlerKendaraanDistributtor.veriifikasiKendaraan)
router.get('/detail/:id', controlerKendaraanDistributtor.detailKendaraan)
router.post('/detail/:id', authorization, controlerKendaraanDistributtor.getKendaraanDistributorById)
router.post('/create', controlerKendaraanDistributtor.createKendaraandistributtor)
router.post('/create-perusahaan', controlerKendaraanDistributtor.createKendaraanPerusahaan)
router.put('/update/:id', authorization, controlerKendaraanDistributtor.updateKendaraanDistributtor)
router.put('/tolak/:id', controlerKendaraanDistributtor.tolakKenendaraan)
router.put('/aktif/:id', controlerKendaraanDistributtor.kendaraanDiAktifkan)
router.put('/tidak-aktif/:id', controlerKendaraanDistributtor.kendaraanDiNonaktifkan)
router.delete('/delete/:id', controlerKendaraanDistributtor.deleteKendaraanDistributtor)

module.exports = router
// import middleware
const authorization = require("../../midelware/authorization");
const fileType = require("../../midelware/file-type-middleware")

// controler distributtor
const controlerKendaraanDistributtor = require('../../controler/distributtor/kendaraanDistributtor')

const router = require('express').Router()

router.get('/list', controlerKendaraanDistributtor.getKendaraanDistributor)
router.get('/detail/:id', authorization, controlerKendaraanDistributtor.getKendaraanDistributorById)
router.post('/create', controlerKendaraanDistributtor.createKendaraandistributtor)
router.put('/update/:id', controlerKendaraanDistributtor.updateKendaraanDistributtor)
router.delete('/delete/:id', controlerKendaraanDistributtor.deleteKendaraanDistributtor)

module.exports = router
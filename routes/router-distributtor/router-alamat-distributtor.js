// import middleware
const authorization = require("../../midelware/authorization");
const fileType = require("../../midelware/file-type-middleware")

// controler distributtor
const controlerAlamatDistributtor = require('../../controler/distributtor/alamatDistributtor')

const router = require('express').Router()

router.get('/list', controlerAlamatDistributtor.getDataAlamatDistributtor)
router.get('/detail/:id', controlerAlamatDistributtor.getDataAlamatDistributtorById)
router.post('/create', controlerAlamatDistributtor.createDataAlamatDistributtor)
router.put('/update/:id', controlerAlamatDistributtor.updateDataAlamatDistributtor)
router.delete('/delete/:id', controlerAlamatDistributtor.deleteDataAlamataDistributtor)

module.exports = router
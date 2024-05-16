// import middleware
const authorization = require("../../midelware/authorization");
const fileType = require("../../midelware/file-type-middleware")

// controler distributtor
const controlerAlamatPenanggungJawab = require('../../controler/distributtor/alamatPenanggungJawab')

const router = require('express').Router()

router.get('/list', controlerAlamatPenanggungJawab.getDataAlamatDistributtor)
router.get('/detail/:id', controlerAlamatPenanggungJawab.getDataAlamatDistributtorById)
router.post('/create', controlerAlamatPenanggungJawab.createDataAlamatDistributtor)
router.put('/update/:id', controlerAlamatPenanggungJawab.updateDataAlamatDistributtor)
router.delete('/delete/:id', controlerAlamatPenanggungJawab.deleteDataAlamataDistributtor)

module.exports = router
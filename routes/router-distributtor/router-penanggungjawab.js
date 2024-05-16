// import middleware
const authorization = require("../../midelware/authorization");
const fileType = require("../../midelware/file-type-middleware")

// controler distributtor
const controlerPenanggungJawab = require('../../controler/distributtor/penanggungjawabDistributtor')

const router = require('express').Router()

router.get('/list', controlerPenanggungJawab.getPenanggungJawaDistributtor)
router.get('/detail/:id', controlerPenanggungJawab.getPenangungJawabDistributtorById)
router.post('/create', controlerPenanggungJawab.createPenanggungJawabDistributtor)
router.put('/update/:id', controlerPenanggungJawab.updatePenanggungJawabDistributtor)
router.delete('/delete/:id', controlerPenanggungJawab.deletePenanggungJawabDistributtor)

module.exports = router
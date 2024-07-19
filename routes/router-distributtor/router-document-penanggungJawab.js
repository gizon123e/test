// import middleware
const authorization = require("../../midelware/authorization");
const fileType = require("../../midelware/file-type-middleware")

// controler distributtor
const controlerDocumentPenanggungJawab = require('../../controler/distributtor/documentPenanggungJawab')

const router = require('express').Router()

router.get('/list', controlerDocumentPenanggungJawab.getDocumentPenanggungJawab)
router.get('/detail/:id', controlerDocumentPenanggungJawab.getDocumentPenanggungJawabById)
router.post('/create', controlerDocumentPenanggungJawab.createDocumentPenanggungJawab)
router.put('/update/:id', controlerDocumentPenanggungJawab.updateDocumentPenanggungJawab)
router.delete('/delete/:id', controlerDocumentPenanggungJawab.deleteDocumentPenanggungJawab)

module.exports = router
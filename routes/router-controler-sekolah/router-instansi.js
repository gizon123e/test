const router = require('express').Router()
const controlerInstansi = require('../../controler/controler-sekolah/layananInstansi')

router.get("/list", controlerInstansi.getAllInstansi)
router.post("/create", controlerInstansi.createDataInstansi)

module.exports = router
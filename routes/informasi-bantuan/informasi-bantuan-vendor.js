const router = require('express').Router()

const { createInformasiBantuanVendor } = require('../../controler/informasi-bantuan/informasi-bantuan-vendor')

router.post('/cerate-informasi-bantuan-vendor', createInformasiBantuanVendor)

module.exports = router
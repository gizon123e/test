const router = require('express').Router()
const { createInformasiBantuanKonsumen, getInformasiBantuanKonsumen } = require('../../controler/informasi-bantuan/informasi-bantuan-konsumen')

router.get('/get-informasi-konsumen', getInformasiBantuanKonsumen)
router.post('/cerate-informasi-konsumen', createInformasiBantuanKonsumen)

module.exports = router
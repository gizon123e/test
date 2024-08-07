// controler distributtor
const controlerAdminPanel = require('../../controler/adminPanel/adminPanel')
const controlerPenelInvoice = require('../../controler/adminPanel/invoicePanel')
const authorization = require('../../midelware/authorization')

const router = require('express').Router()

router.get('/biaya-tetap', controlerAdminPanel.getBiayaTetap)
router.get('/biaya-tetap/:id', controlerAdminPanel.findByIdBiayaTetap)
router.get('/detail-virtual-account/:id', controlerAdminPanel.userDetailId)
router.get('/detail-user/:id', controlerAdminPanel.getDataDetailUser)
router.get('/pesanan', controlerAdminPanel.getAllPesananKonsument)
router.get('/pesanan/:id', controlerAdminPanel.getByIdPesanan)
router.get('/pengiriman', controlerAdminPanel.getAllPengiriman)
router.get('/pembatalan', controlerAdminPanel.getAllPembatalan)
router.get('/transaksi', controlerAdminPanel.getAllTransaksi)
router.get('/invoice', controlerPenelInvoice.getAllInvoice)
router.post('/register-panel', controlerAdminPanel.register)
router.post('/login-panel', authorization, controlerAdminPanel.login)
router.put("/tolak-document/:id", controlerAdminPanel.tolakVerivikasiDocument)
router.put('/update-biaya-tetap/:id', controlerAdminPanel.updateBiayaTetap)

module.exports = router
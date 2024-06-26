// controler distributtor
const controlerAdminPanel = require('../../controler/adminPanel/adminPanel')

const router = require('express').Router()

router.get('/biaya-tetap', controlerAdminPanel.getBiayaTetap)
router.get('/biaya-tetap/:id', controlerAdminPanel.findByIdBiayaTetap)
router.get('/detail-virtual-account/:id', controlerAdminPanel.userDetailId)
router.get('/detail-user/:id', controlerAdminPanel.getDataDetailUser)
router.post('/register-panel', controlerAdminPanel.register)
router.post('/login-panel', controlerAdminPanel.login)
router.put("/tolak-document/:id", controlerAdminPanel.tolakVerivikasiDocument)
router.put('/update-biaya-tetap/:id', controlerAdminPanel.updateBiayaTetap)

module.exports = router
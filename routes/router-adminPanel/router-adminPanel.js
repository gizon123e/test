// controler distributtor
const controlerAdminPanel = require('../../controler/adminPanel/adminPanel')

const router = require('express').Router()

router.post('/register-panel', controlerAdminPanel.register)
router.post('/login-panel', controlerAdminPanel.login)
router.get('/detail-virtual-account/:id', controlerAdminPanel.userDetailId)
router.get('/detail-user/:id', controlerAdminPanel.getDataDetailUser)
router.put("/tolak-document/:id", controlerAdminPanel.tolakVerivikasiDocument)

module.exports = router
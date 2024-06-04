// controler distributtor
const controlerAdminPanel = require('../../controler/adminPanel/adminPanel')

const router = require('express').Router()

router.post('/register-panel', controlerAdminPanel.register)
router.post('/login-panel', controlerAdminPanel.login)
router.get('/detail-virtual-account/:id', controlerAdminPanel.userDetailId)

module.exports = router
// controler distributtor
const controlerAdminPanel = require('../../controler/adminPanel/adminPanel')

const router = require('express').Router()

router.post('/register-panel', controlerAdminPanel.register)
router.post('/login-panel', controlerAdminPanel.login)

module.exports = router
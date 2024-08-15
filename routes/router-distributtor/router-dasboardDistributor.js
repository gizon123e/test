const router = require('express').Router()
const authorization = require('../../midelware/authorization')
const { getAllDasboard } = require('../../controler/distributtor/dasboard')

router.get('/', authorization, getAllDasboard)

module.exports = router
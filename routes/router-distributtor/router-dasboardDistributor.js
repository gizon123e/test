const router = require('express').Router()
const authorization = require('../../midelware/authorization')
const { getAllDasboard, getGrafikPerforma } = require('../../controler/distributtor/dasboard')

router.get('/dasboard', authorization, getAllDasboard)
router.get('/grafik-performa', authorization, getGrafikPerforma);

module.exports = router
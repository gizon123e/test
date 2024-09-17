const router = require('express').Router()
const authorization = require('../../midelware/authorization')
const { getAllDasboard, getGrafikPerforma, rataPengiriman } = require('../../controler/distributtor/dasboard')

router.get('/dasboard', authorization, getAllDasboard)
router.get('/grafik-performa', authorization, getGrafikPerforma);
router.get('/rata-rata-layanan', authorization, rataPengiriman)

module.exports = router
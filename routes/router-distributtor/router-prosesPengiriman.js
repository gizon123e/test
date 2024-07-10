const router = require('express').Router()

const controlerProsesPengiriman = require('../../controler/distributtor/proses-pengiriman')

router.get('/list', controlerProsesPengiriman.getAllProsesPengiriman)
router.get('/detail/:id', controlerProsesPengiriman.getDetailProsesPengiriman)

module.exports = router
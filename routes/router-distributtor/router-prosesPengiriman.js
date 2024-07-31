const router = require('express').Router()

const controlerProsesPengiriman = require('../../controler/distributtor/proses-pengiriman')

router.get('/list', controlerProsesPengiriman.getAllProsesPengiriman)
router.get('/detail/:id', controlerProsesPengiriman.getDetailProsesPengiriman)
router.get('/status/:pengirimanId/:prosesPengirimanId', controlerProsesPengiriman.updateStatusProsesPengiriman)

module.exports = router
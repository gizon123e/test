const router = require('express').Router()
const authorization = require('../../midelware/authorization')

const controlerProsesPengiriman = require('../../controler/distributtor/proses-pengiriman')

router.get('/list', authorization, controlerProsesPengiriman.getAllProsesPengiriman)
router.get('/detail/:id', controlerProsesPengiriman.getDetailProsesPengiriman)
router.get('/status/:pengirimanId/:prosesPengirimanId', controlerProsesPengiriman.updateStatusProsesPengiriman)

module.exports = router
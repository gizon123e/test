const router = require('express').Router()
const authorization = require('../../midelware/authorization')

const controlerProsesPengiriman = require('../../controler/distributtor/proses-pengiriman')

router.get('/list', authorization, controlerProsesPengiriman.getAllProsesPengiriman);
router.get('/detail/:id', controlerProsesPengiriman.getDetailProsesPengiriman);
router.put('/mulai-penjemputan/:id', authorization, controlerProsesPengiriman.mulaiPenjemputan);

module.exports = router
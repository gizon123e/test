const router = require('express').Router()
const authorization = require('../../midelware/authorization')

const controlerProsesPengiriman = require('../../controler/distributtor/proses-pengiriman')

router.get('/list', authorization, controlerProsesPengiriman.getAllProsesPengiriman);
router.get('/detail/:id', controlerProsesPengiriman.getDetailProsesPengiriman);
router.put('/update/:id', controlerProsesPengiriman.updatePerusahaanPenegmudiDanKendaraan)
router.put('/mulai-penjemputan/:id', authorization, controlerProsesPengiriman.mulaiPenjemputan);
router.put('/sudah-penjemputan/:id', authorization, controlerProsesPengiriman.sudahDiJemput);
router.put('/mulai-pengiriman/:id', authorization, controlerProsesPengiriman.mulaiPengiriman);
router.put('/pesanan-diserahkan/:id', authorization, controlerProsesPengiriman.pesasanSelesai);

module.exports = router
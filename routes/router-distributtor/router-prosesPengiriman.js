const router = require('express').Router()
const authorization = require('../../midelware/authorization')

const controlerProsesPengiriman = require('../../controler/distributtor/proses-pengiriman')

router.get('/list', authorization, controlerProsesPengiriman.getAllProsesPengiriman);
router.get('/detail/:id', controlerProsesPengiriman.getDetailProsesPengiriman);
router.put('/mulai-penjemputan/:id', authorization, controlerProsesPengiriman.mulaiPenjemputan);
router.put('/sudah-penjemputan/:id', authorization, controlerProsesPengiriman.sudahDiJemput);
router.put('/mulai-pengiriman/:id', authorization, controlerProsesPengiriman.mulaiPengiriman);
router.put('/pesanan-diserahkan/:id', authorization, controlerProsesPengiriman.pesasanSelesai);

// perusahaan
router.put('/mulai-penjemputan-perusahaan/:id', controlerProsesPengiriman.mulaiPenjemputanPerusahaan);
router.put('/sudah-penjemputan-perusahaan/:id', controlerProsesPengiriman.sudahDiJemputPerusahaan);
router.put('/mulai-pengiriman-perusahaan/:id', controlerProsesPengiriman.mulaiPengirimanPerusahaan);
router.put('/pesanan-diserahkan-perusahaan/:id', controlerProsesPengiriman.pesasanSelesaiPerusahaan);

module.exports = router
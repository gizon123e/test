const router = require('express').Router();
const controllerPangan = require('../controler/pangan');

router.get('/', controllerPangan.getPanganByKelompok);
router.get('/detail/:id', controllerPangan.getDetailPangan);
router.get('/search', controllerPangan.searchPanganByName);
router.get('/kebutuhan_gizi', controllerPangan.getKebutuhanGizi);
router.get("/kelompok_pangan/all", controllerPangan.getAllKelompokPangan);
router.get('/list', controllerPangan.getAllPangan)
router.post("/kelompok_pangan/upload", controllerPangan.uploadKelompokPangan);
router.get('/topping', controllerPangan.getTopping);

module.exports = router;
const router = require('express').Router();
const controllerPangan = require('../controler/pangan');

router.get('/', controllerPangan.getPanganByKelompok)
router.get("/kelompok_pangan/all", controllerPangan.getAllKelompokPangan);
router.post("/kelompok_pangan/upload", controllerPangan.uploadKelompokPangan);

module.exports = router;
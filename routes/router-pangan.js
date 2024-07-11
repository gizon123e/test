const router = require('express').Router();
const controllerPangan = require('../controler/pangan');

router.post("/kelompok_pangan/upload", controllerPangan.uploadKelompokPangan)

module.exports = router;
const router = require("express").Router();
const controllerSekolah = require('../controler/sekolah')

router.get('/npsn/:NPSN', controllerSekolah.checkNpsn);
router.get('/list', controllerSekolah.getAllSkolah)

module.exports = router
const router = require('express').Router()
const controllerSekolah = require('../../controler/konsumen/sekolah')
const authorization = require("../../midelware/authorization")

router.get('/list/:id', controllerSekolah.getAllSekolah);
router.get('/detail/:id', authorization, controllerSekolah.getDetailSekolah);
router.get('/simulasi/:id', controllerSekolah.getByNPSNSekolahSimulasi);
router.post("/create", authorization, controllerSekolah.createSekolah);

module.exports = router
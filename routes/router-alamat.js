const router = require("express").Router();
const controllerAlamat = require('../controler/alamat');

router.get('/provinsi', controllerAlamat.getProvinsi);
router.get('/provinsi/:id', controllerAlamat.getDetailProvinsi);
router.get('/regency/:id', controllerAlamat.getRegency);
router.get('/district/:id', controllerAlamat.getDistrict);
router.get('/village/:id', controllerAlamat.getVillage);


module.exports = router;
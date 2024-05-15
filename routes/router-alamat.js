const router = require("express").Router();
const controllerAlamat = require('../controler/alamat');

router.get('/', controllerAlamat.getProvinsi);
module.exports = router;
const router = require('express').Router();
const controllerTemporary = require('../controler/temporaryUser')

router.get('/detail/:id', controllerTemporary.getDetailTemporary);
router.put('/update', controllerTemporary.updateUser);
router.put('/update/toko', controllerTemporary.updateDataToko);
router.put('/update/pic', controllerTemporary.updatePic);

module.exports = router
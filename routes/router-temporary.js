const router = require('express').Router();
const controllerTemporary = require('../controler/temporaryUser')

router.get('/detail', controllerTemporary.getDetailTemporary);
router.put('/update', controllerTemporary.updateConsumen);

module.exports = router
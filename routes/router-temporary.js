const router = require('express').Router();
const controllerTemporary = require('../controler/temporaryUser')

router.put('/update', controllerTemporary.updateConsumen);

module.exports = router
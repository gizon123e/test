const router = require('express').Router();
const controllerMinat = require("../controler/minat");
const authorization = require('../midelware/authorization');

router.get('/get', authorization, controllerMinat.getMinat)
router.post("/add", authorization, controllerMinat.addMinat);

module.exports = router;
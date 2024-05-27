const router = require("express").Router();
const controllerGratong = require("../controler/gratong");

router.post("/create", controllerGratong.createGratong);

module.exports = router
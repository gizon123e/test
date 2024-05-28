const router = require("express").Router();
const controllerGratong = require("../controler/gratong");

router.get("/list", controllerGratong.getGratong);
router.post("/create", controllerGratong.createGratong);

module.exports = router
const router = require("express").Router();
const controllerGratong = require("../controler/gratong");

router.get("/list", controllerGratong.getGratong);
router.post("/create", controllerGratong.createGratong);
router.put("/edit/:id", controllerGratong.editGratong);
router.delete("/delete/:id", controllerGratong.deteleGratong);

module.exports = router;

// import midelware authorization
const authorization = require("../midelware/authorization");

// import controler
const controllerVendor = require("../controler/vendor/vendor");

const router = require("express").Router();

// router auth user
router.get('/listAll', authorization, controllerVendor.getAllVendor);
router.get('/detail/:id', authorization, controllerVendor.getDetailVendor)
router.post("/create", authorization, controllerVendor.createVendor);
router.put("/update/:id", authorization, controllerVendor.updateVendor);
router.delete("/delete/:id", authorization, controllerVendor.deleteVendor);

module.exports = router;

// import middleware
const authorization = require("../midelware/authorization");
const fileType = require("../midelware/file-type-middleware");

// import controler
const controllerVendor = require("../controler/vendor/vendor");
const controllerToko = require('../controler/vendor/toko-vendor')

const router = require("express").Router();

// router auth user
router.get('/listAll', authorization, controllerVendor.getAllVendor);
router.get('/detail/:id', authorization, controllerVendor.getDetailVendor);
router.post("/create", controllerVendor.createVendor);
router.post("/create/toko", controllerToko.createToko);
router.put("/update/:id", authorization, fileType, controllerVendor.updateVendor);
router.delete("/delete/:id", authorization, controllerVendor.deleteVendor);

module.exports = router;

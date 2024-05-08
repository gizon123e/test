// import middleware
const authorization = require("../midelware/authorization");
const fileType = require("../midelware/file-type-middleware");

// import controler
const controllerVendor = require("../controler/vendor/vendor");

const router = require("express").Router();

// router auth user
router.get('/listAll', authorization, controllerVendor.getAllVendor);
router.get('/detail/:id', authorization, controllerVendor.getDetailVendor)
router.post("/create", authorization, fileType, controllerVendor.createVendor);
router.put("/update/:id", authorization, fileType, controllerVendor.updateVendor);
router.delete("/delete/:id", authorization, controllerVendor.deleteVendor);

module.exports = router;

// import middleware
const authorization = require("../midelware/authorization");
const fileType = require("../midelware/file-type-middleware");

// import controler
const controllerSupplier = require("../controler/supplier/supplier");

const router = require("express").Router();

// router auth user
router.get('/listAll', authorization, controllerSupplier.getAllSupplier);
router.get('/detail', authorization, controllerSupplier.getDetailSupplier)
router.post("/create", controllerSupplier.createSupplier);
router.put("/update/:id", authorization, fileType, controllerSupplier.updateSupplier);
router.delete("/delete/:id", authorization, controllerSupplier.deleteSupplier);

module.exports = router;

// import midelware authorization
const authorization = require("../midelware/authorization");

// import controler
const controllerSupplier = require("../controler/supplier/supplier");

const router = require("express").Router();

// router auth user
router.get('/listAll', authorization, controllerSupplier.getAllSupplier);
router.get('/detail/:id', authorization, controllerSupplier.getDetailSupplier)
router.post("/create", authorization, controllerSupplier.createSupplier);
router.put("/update/:id", authorization, controllerSupplier.updateSupplier);
router.delete("/delete/:id", authorization, controllerSupplier.deleteSupplier);

module.exports = router;

// import midelware authorization
const authorization = require("../midelware/authorization");

// import controler
const controllerKonsumen = require("../controler/konsumen/konsumen");

const router = require("express").Router();

// router auth user
router.get('/listAll', authorization, controllerKonsumen.getAllKonsumen);
router.get('/detail/:id', authorization, controllerKonsumen.getDetailKonsumen)
router.post("/create", authorization, controllerKonsumen.createKonsumen);
router.put("/update/:id", authorization, controllerKonsumen.updateKonsumen);
router.delete("/delete/:id", authorization, controllerKonsumen.deleteKonsumen);

module.exports = router;

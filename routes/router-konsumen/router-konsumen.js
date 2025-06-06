// import middleware
const authorization = require("../../midelware/authorization");
const fileType = require("../../midelware/file-type-middleware");

// import controler
const controllerKonsumen = require("../../controler/konsumen/konsumen");

const router = require("express").Router();

// router auth user
router.get('/listAll', authorization, controllerKonsumen.getAllKonsumen);
router.get('/detail', authorization, controllerKonsumen.getDetailKonsumen);
router.get("/toko-favorit", authorization, controllerKonsumen.tokoFavorit);
router.get("/toko-rekomendasi", authorization, controllerKonsumen.rekomendasiToko);
router.post("/create", controllerKonsumen.createKonsumen);
router.put("/update", authorization, controllerKonsumen.updateKonsumen);
router.delete("/delete/:id", authorization, controllerKonsumen.deleteKonsumen);

module.exports = router;

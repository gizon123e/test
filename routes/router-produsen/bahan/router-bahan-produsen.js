const authorization = require("../../../midelware/authorization");
//import preventing empty data
const emptyData = require("../../../midelware/emptyData");
const controllerProdusen = require("../../../controler/produsen/bahan/produsen");

const router = require("express").Router();

router.get("/bahan/listAll", authorization, emptyData, controllerProdusen.getAllBahan)
router.get("/production/list", authorization, emptyData, controllerProdusen.listProduction)
router.post("/production/create", authorization, emptyData, controllerProdusen.createProduction)
router.post("/bahan/create", authorization, emptyData, controllerProdusen.createBahanBaku)
router.put("/bahan/addStok", authorization, emptyData, controllerProdusen.updateBahanBaku)


module.exports = router
const authorization = require("../midelware/authorization");
//import middleware role clasification
const roleClasification = require("../midelware/user-role-clasification");
//import preventing empty data
const emptyData = require("../midelware/emptyData");
const controllerProdusen = require("../controler/produsen");

const router = require("express").Router();

router.post("/production/create", authorization, emptyData, controllerProdusen.createProduction)
router.post("/bahan/add", authorization, emptyData, controllerProdusen.createBahanBaku)


module.exports = router
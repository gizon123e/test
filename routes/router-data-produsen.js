// import midelware authorization
const authorization = require("../midelware/authorization");

// import controler
const controllerProdusen = require("../controler/produsen/produsen");

const router = require("express").Router();

// router auth user
router.get('/listAll', authorization, controllerProdusen.getAllProdusen);
router.get('/detail', authorization, controllerProdusen.getDetailProdusen)
router.post("/create", authorization, controllerProdusen.createProdusen);
router.put("/update/:id", authorization, controllerProdusen.updateProdusen);
router.delete("/delete/:id", authorization, controllerProdusen.deleteProdusen);

module.exports = router;

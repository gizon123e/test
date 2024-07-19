// import middleware
const authorization = require("../midelware/authorization");
const fileType = require("../midelware/file-type-middleware");
// import controler
const controllerProdusen = require("../controler/produsen/produsen");

const router = require("express").Router();

// router auth user
router.get('/listAll', authorization, controllerProdusen.getAllProdusen);
router.get('/detail', authorization, controllerProdusen.getDetailProdusen)
router.post("/create", controllerProdusen.createProdusen);
router.put("/update/:id", authorization, fileType, controllerProdusen.updateProdusen);
router.delete("/delete/:id", authorization, controllerProdusen.deleteProdusen);

module.exports = router;

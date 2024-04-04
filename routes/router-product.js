// import midelware authorization
const authorization = require("../midelware/authorization");

// import controler
const controlerProduct = require("../controler/product");

const router = require("express").Router();

// router product management
router.post("/upload", authorization, controlerProduct.upload);
router.put('/edit', authorization, controlerProduct.edit)
router.delete('/delete', authorization, controlerProduct.delete)

module.exports = router;

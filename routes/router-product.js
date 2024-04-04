// import midelware authorization
const authorization = require("../midelware/authorization");

//import middleware role clasification
const roleClasification = require("../midelware/user-role-clasification")


// import controler
const controlerProduct = require("../controler/product");

const router = require("express").Router();

// router product management
router.post("/upload", authorization, roleClasification, controlerProduct.upload);
router.post("/list", authorization, roleClasification, controlerProduct.list_product);
router.put('/edit', authorization, controlerProduct.edit)
router.delete('/delete', authorization, controlerProduct.delete)

module.exports = router;

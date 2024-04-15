// import midelware authorization
const authorization = require("../midelware/authorization");

//import middleware role clasification
const roleClasification = require("../midelware/user-role-clasification")


// import controler
const controlerProduct = require("../controler/product");

const router = require("express").Router();

// router product management
router.get("/list", controlerProduct.list_product);
router.get("/list/admin", authorization, controlerProduct.listProductAdmin)
router.get('/detail/:id', controlerProduct.productDetail)
router.post("/upload", authorization, controlerProduct.upload);
router.post("/addComment", authorization, emptyData, controlerProduct.addComment);
router.put('/editPemasok', authorization, emptyData, roleClasification.vendor, controlerProduct.pemasok)
router.put('/edit', authorization, controlerProduct.edit)
router.delete('/delete', authorization, controlerProduct.delete)

module.exports = router;

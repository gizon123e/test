// import midelware authorization
const authorization = require("../midelware/authorization");
//import middleware role clasification
const roleClasification = require("../midelware/user-role-clasification");
//import preventing empty data
const emptyData = require("../midelware/emptyData");

// import controler
const controlerProduct = require("../controler/product");

const router = require("express").Router();

// router product management
router.get("/list", controlerProduct.list_product);
router.get("/detail/:id", controlerProduct.productDetail);
router.get('/list_all', authorization , controlerProduct.list_all)
router.post("/upload", authorization, controlerProduct.upload);
router.post("/addComment", authorization, emptyData, controlerProduct.addComment);
router.put('/performance', authorization, controlerProduct.updateProductPerformance)
router.put("/editPemasok", authorization, emptyData, roleClasification.vendor, controlerProduct.pemasok);
router.put("/edit", authorization, controlerProduct.edit);
router.delete("/delete", authorization, controlerProduct.delete);

module.exports = router;

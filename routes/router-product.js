// import midelware
const authorization = require("../midelware/authorization");
const roleClasification = require("../midelware/user-role-clasification");
const notEmptyDetailData = require("../midelware/detail-data-check");
const typeFiles = require("../midelware/file-type-middleware");
//import preventing empty data
const emptyData = require("../midelware/emptyData");

// import controler
const controlerProduct = require("../controler/product");

const router = require("express").Router();

// router product management
router.get("/search", controlerProduct.search);
router.get("/detail/:id", authorization, controlerProduct.productDetail);
router.get('/filter', authorization, controlerProduct.filterProduk);
router.get("/product_by_main_category/:id", authorization, controlerProduct.getProductWithMain);
router.get("/all_product_by_main_category/:id", authorization, controlerProduct.getAllProductWithMain);
router.get("/product_by_specific_category/:id", authorization, controlerProduct.getProductWithSpecific);
router.get("/product_by_sub_category/:id", authorization, controlerProduct.getProductWithSub);
router.get("/list_all", authorization, controlerProduct.list_all);
router.get("/list_panel", authorization, controlerProduct.list_product_adminPanel);
router.get("/check_reviewed", authorization, controlerProduct.checkReviewedProduct);
router.post("/upload", authorization, notEmptyDetailData, controlerProduct.upload);
router.put("/performance", authorization, controlerProduct.updateProductPerformance);
router.put("/verify/:id", authorization, controlerProduct.verifyOrBlockProduct);
router.put("/editPemasok", authorization, emptyData, roleClasification.vendor, controlerProduct.pemasok);
router.put("/edit", authorization, controlerProduct.edit);
router.put("/arsipkan", authorization, controlerProduct.arsipkanProduct);
router.put("/edit_reviewed", authorization, controlerProduct.editReviewed);
router.delete("/delete/:productId", authorization, controlerProduct.delete);
router.get("/product_with_radius_konsumen", authorization, controlerProduct.getProductWithRadiusKonsumen);
router.get('/prod-supplier', controlerProduct.list_product_adminPanelSupplier)

module.exports = router;

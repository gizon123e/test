//Middleware
const authorization = require("../midelware/authorization");

const report = require("../controler/report");
const router = require("express").Router();

router.get("/sales", authorization, report.salesReportPerProduct);
router.get("/performance", authorization, report.performancePerProduct)
module.exports = router;

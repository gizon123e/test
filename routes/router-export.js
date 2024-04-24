//Middleware
const authorization = require("../midelware/authorization");

const report = require("../controler/export-excel");
const router = require("express").Router();

router.post("/sell", authorization, report.penjualan)
router.post("/performance", authorization, report.performance)
router.post("/trend", authorization, report.trend)


module.exports = router;

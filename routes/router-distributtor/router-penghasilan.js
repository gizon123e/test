const authorization = require("../../midelware/authorization");
const controllerPenghasilan = require('../../controler/distributtor/penghasilan')
const router = require("express").Router();

router.get('/', authorization, controllerPenghasilan.getPenghasilan);
router.get('/total', authorization, controllerPenghasilan.getTotalPenghasilan);
router.get('/riwayat-keuangan', authorization, controllerPenghasilan.getRiwayatKeuangan);
router.get('/grafik-keuangan', authorization, controllerPenghasilan.getGrafikPenghasilan);

module.exports = router;
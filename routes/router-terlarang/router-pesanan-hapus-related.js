const terkaitPesanan = require("../../controler/endpoint-terlarang/terkait-pesanan");
const router = require("express").Router()

router.delete("/hapus/terkait-pesanan", terkaitPesanan);

module.exports = router
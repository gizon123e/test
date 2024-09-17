const router = require('express').Router()

const controlerTrakingKonsumen = require('../../controler/distributtor/pelacakanDistributorKonsumen')
const controlerTrakingToko = require('../../controler/distributtor/pelacakanDistributorToko')

router.get('/toko/:id_distributor/:id_toko', controlerTrakingToko.getTrekingDistributor)
router.get('/konsumen/:id_toko/:id_address', controlerTrakingKonsumen.getTrekingDistributor)
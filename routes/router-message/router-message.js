const router = require('express').Router()

const { getContacts, createOrUpdateContact } = require('../../controler/message/vendor-distributor/contak-vendor-distributor')

router.get('/list/:userId/:id_toko ', getContacts)
router.post('create', createOrUpdateContact)

module.exports = router


const router = require('express').Router()
const { getAllCampeniProfileMBG, getByIdCampeniProfileMBG, createCampeniProfileMBG, updateCampeniProfileMBG } = require('../../controler/campeniprofile/mbg')

router.get('/list', getAllCampeniProfileMBG)
router.get('/detail/:id', getByIdCampeniProfileMBG)
router.post('/create', createCampeniProfileMBG)
router.put('/update/:id', updateCampeniProfileMBG)

module.exports = router
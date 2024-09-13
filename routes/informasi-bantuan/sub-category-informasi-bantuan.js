const router = require('express').Router()

const { getSubCategoryInformasiBantuan, createSubCategoryInformasiBantuan } = require('../../controler/informasi-bantuan/sub-category-judul-informasi')

router.get('/list-sub-judul/:id', getSubCategoryInformasiBantuan)
router.post('/create-sub-judul', createSubCategoryInformasiBantuan)

module.exports = router
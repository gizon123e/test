const CategoryInformasiPertanyaan = require('../../models/informasi-bantuan/category-inforrmasi-bantuan')
const path = require('path')
require('dotenv').config()

module.exports = {
    getCategoryUtamaInformasiBantuan: async (req, res, next) => {
        try {
            const { role } = req.query
            let query = {}
            if (role) {
                query.role = role
            }
            const data = await CategoryInformasiPertanyaan.find(query)

            res.status(200).json({
                message: 'get data success',
                data
            })
        } catch (error) {
            console.log(error)
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                })
            }
            next(error)
        }
    },

    createCategoryUtamaInformasiBantuan: async (req, res, next) => {
        try {
            const { nama, role } = req.body
            const files = req.files;
            const icon = files ? files.icon : null;

            if (!icon) return res.status(400).json({ message: "file icon harus di isi" })

            const namaIcon = `${Date.now()}${path.extname(icon.name)}`;
            const imageIcon = path.join(__dirname, '../../public/icon-bantuan', namaIcon);

            await icon.mv(imageIcon);

            const data = await CategoryInformasiPertanyaan.create({ nama, role, icon: `${process.env.HOST}public/icon-bantuan/${namaIcon}` })

            res.status(200).json({
                message: "create data success",
                data
            })
        } catch (error) {
            console.log(error)
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                })
            }
            next(error)
        }
    }
}
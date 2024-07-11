const path = require("path");
const { Pangan, KelompokPangan } = require("../models/model-pangan");
const fs = require('fs')
const env = require('dotenv')
env.config()
module.exports = {
    uploadKelompokPangan: async( req, res, next ) => {
        try {
            const { icon } = req.files;
            const { nama, deskripsi } = req.body;
            const fileName = `${nama}${path.extname(icon.name)}`
            const filePath = path.join(__dirname, '../public', 'icon', fileName);
            const urlFile = `${process.env.HOST}public/icon/${fileName}`
            await icon.mv(filePath);

            await KelompokPangan.create({
                nama,
                deskripsi,
                icon: urlFile
            });

            return res.status(200).json({message: "Berhasil Menambah Kelompok Pangan"})
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
}
const Gratong = require('../models/model-gratong');
const createDate = require('../utils/createDateString');

module.exports = {
    createGratong: async (req, res, next) =>{
        try {
            const { jenis, tarif, nilai_gratong, start, end } = req.body
            console.log(req.body)
            const startTime = createDate(start);
            const endTime = createDate(end)
            const newGratong = await Gratong.create({
                startTime,
                endTime,
                jenis,
                nilai_gratong,
                tarif
            });

            return res.status(201).json({message: "Berhasil Menambahkan Event Gratis Ongkir", data: newGratong})
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}
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
            next(error);
        }
    },
    getGratong: async (req, res, next) => {
        try {
            const gratongs = await Gratong.find().populate({
                path: "tarif",
            });
            if(!gratongs || gratongs.length === 0) return res.status(404).json({message: "No-Event"});
            return res.status(200).json({message: "Berhasil mendapatkan gratong", data: gratongs})
        } catch (error) {
            console.log(error);
            next(error);
        }
    }
}
const Gratong = require('../models/model-gratong');
const createDate = require('../utils/createDateString');

module.exports = {
    createGratong: async (req, res, next) =>{
        try {
            const { jenis, tarif, nilai_gratong, start, end, nama } = req.body
            const startTime = createDate(start);
            const endTime = createDate(end)
            const newGratong = await Gratong.create({
                nama,
                startTime,
                endTime,
                jenis,
                nilai_gratong,
                tarif
            });

            return res.status(201).json({message: "Berhasil Menambahkan Event Gratis Ongkir", data: newGratong})
        } catch (error) {
            console.log(error);
            if (error && error.name == "ValidationError") {
                return res.status(400).json({
                  error: true,
                  message: error.message,
                  fields: error.fields,
                });
            }
            next(error);
        }
    },
    getGratong: async (req, res, next) => {
        try {
            const gratongs = await Gratong.aggregate([
                {
                    $match: {}
                },
                {
                    $lookup:{
                        from: "tarifs",
                        foreignField: "_id",
                        localField: 'tarif',
                        as: "detail_tarif"
                    }
                },
                {
                    $unwind: "$detail_tarif"
                },
                {
                    $addFields:{
                        'tarif': '$detail_tarif'
                    }
                },
                {
                    $lookup:{
                        from: "jeniskendaraans",
                        foreignField: "_id",
                        localField: 'tarif.jenis_kendaraan',
                        as: 'kendaraan'
                    }
                },
                {
                    $unwind: "$kendaraan"
                },
                {
                    $addFields:{
                        'tarif.jenis_kendaraan': '$kendaraan'
                    }
                },
                {
                    $lookup: {
                        from: 'jenisjasadistributors',
                        localField: 'tarif.jenis_jasa',
                        foreignField: "_id",
                        as: "detail_jenis_jasa"
                    }
                },
                {
                    $unwind: "$detail_jenis_jasa"
                },
                {
                    $addFields:{
                        'tarif.jenis_jasa': '$detail_jenis_jasa'
                    }
                },
                {
                    $project: { detail_tarif: 0, kendaraan: 0, detail_jenis_jasa: 0 }
                },
            ])
            // const gratongs = await Gratong.find().populate({
            //     path: "tarif",
            //     populate: {
            //         path: "jenis_kendaraan"
            //     }
            // });
            if(!gratongs || gratongs.length === 0) return res.status(404).json({message: "No-Event"});
            return res.status(200).json({message: "Berhasil mendapatkan gratong", data: gratongs})
        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    editGratong: async(req, res, next)=>{
        try {
            await Gratong.findByIdAndUpdate(req.params.id, {...req.body, startTime: createDate(req.body.startTime), endTime: createDate(req.body.endTime)});
            return res.status(200).json({message: "Berhasil Mengedit Gratis Ongkir"})
        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    deteleGratong: async(req, res, next) => {
        try {
            const id = req.params.id
            const gratong = await Gratong.findById(id);
            if(new Date(gratong.startTime) < new Date() && new Date(gratong.endTime) > new Date()) return res.status(403).json({message: "Tidak Bisa Menghapus Gratis Ongkir yang sedang Berlangsung"})
            await gratong.deleteOne({_id: id});

            return res.status(200).json({message: "Berhasil Menghapus Gratis Ongkir"})
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
}
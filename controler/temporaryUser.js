const { TemporaryPic, TemporaryUser, TemporaryDataToko } = require('../models/model-temporary-user');

module.exports = {
    updateUser: async (req, res, next) => {
        try {
            const { long_pin_alamat, lat_pin_alamat, registerAs } = req.body
            const update = await TemporaryUser.findByIdAndUpdate(req.body.id, {...req.body, pinAlamat: {
                long: long_pin_alamat,
                lat: lat_pin_alamat
            }}, {new: true}).select('-codeOtp -createdAt');
            if(registerAs === "not_individu"){
                await TemporaryPic.create({
                    temporary_user: update._id
                });
            };

            if(update.role !== "konsumen"){
                await TemporaryDataToko.create({
                    tempSeller: update._id
                })
            }
            return res.status(201).json({message: "Berhasil mengedit temporary data", data: update})
        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    getDetailTemporary: async (req, res, next) => {
        try {
            let dataToko
            const data = await TemporaryUser.findById(req.params.id).select('-createdAt');
            if(!data) return res.status(404).json({message:"Tidak ada id " + req.params.id});
            const pic = await TemporaryPic.findOne({temporary_user: req.params.id}).select('-createdAt');
            if(data.role !== "konsumen"){
                dataToko = await TemporaryDataToko.findOne({tempSeller: req.params.id})
            }else{
                dataToko = null
            }
            return res.status(200).json({
                message: "Berhasil mendapatkan detail temporary", 
                user: data, pic: data.registerAs === "not_individu" ? pic : undefined,
                dataToko
            })
        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    updatePic: async(req, res, next) => {
        try {
            const { long_pin_alamat, lat_pin_alamat } = req.body
            const updatePic = await TemporaryPic.findOneAndUpdate({temporary_user: req.body.id}, { ...req.body, pinAlamat: {
                long: long_pin_alamat,
                lat: lat_pin_alamat
            }}).select('-createdAt')
            return res.status(200).json({message: "Berhasil Mengupdate Pic"});
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    
    updateDataToko: async (req, res, next) => {
        try {
            const updatedDataToko = await TemporaryDataToko.findOneAndUpdate({tempSeller: req.body.id}, {
                namaToko: req.body.namaToko,
                province: req.body.province,
                regency: req.body.regency,
                district: req.body.district,
                village: req.body.village,
                address_description: req.body.address_description,
                label: req.body.label,
                code_pos: req.body.code_pos,
                pinAlamat:{
                    long: req.body.long_pin_alamat,
                    lat: req.body.lat_pin_alamat
                }
            }, {new: true});

            return res.status(201).json({message: "Berhasil mengubah data Toko", data: updatedDataToko})
        } catch (error) {
            console.log(error);
            next(error);
        }
    }
}
const { TemporaryPic, TemporaryUser } = require('../models/model-temporary-user');

module.exports = {
    updateConsumen: async (req, res, next) => {
        try {
            const { long_pin_alamat, lat_pin_alamat, registerAs } = req.body
            const update = await TemporaryUser.findByIdAndUpdate(req.body.id, {...req.body, pinAlamat: {
                long: long_pin_alamat,
                lat: lat_pin_alamat
            }}, {new: true}).select('-codeOtp');
            if(registerAs === "not_individu"){
                await TemporaryPic.create({
                    temporary_user: update._id
                });
            };
            return res.status(201).json({message: "Berhasil mengedit temporary data", data: update})
        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    getDetailTemporary: async (req, res, next) => {
        try {
            const data = await TemporaryUser.findById(req.params.id);
            const pic = await TemporaryPic.findOne({temporary_user: req.params.id});
            return res.status(200).json({message: "Berhasil mendapatkan detail temporary", user: data, pic})
        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    updatePic: async(req, res, next) => {
        try {
            const updatePic = await TemporaryPic.findOneAndUpdate({temporary_user: req.body.id}, req.body);
            return res.status(200).json({message: "Berhasil Mengupdate Pic"});
        } catch (error) {
            console.log(error);
            next("error");
        }
    }
}
const { TemporaryPic, TemporaryUser } = require('../models/model-temporary-user');

module.exports = {
    updateConsumen: async (req, res, next) => {
        try {
            const { long_pin_alamat, lat_pin_alamat } = req.body
            const update = await TemporaryUser.findByIdAndUpdate(req.body.id, {...req.body, pinAlamat: {
                long: long_pin_alamat,
                lat: lat_pin_alamat
            }}, {new: true}).select('-codeOtp');
            return res.status(201).json({message: "Berhasil mengedit temporary data", data: update})
        } catch (error) {
            console.log(error)
        }
    }
}
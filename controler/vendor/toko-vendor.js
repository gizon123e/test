const Toko = require('../../models/vendor/model-toko');
const Address = require('../../models/model-address')

module.exports = {
    createToko: async(req, res, next) => {
        try {
            const alamat = await Address.create({
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
            })
            const newDataToko = await Toko.findOneAndUpdate({userId: req.body.id}, {
                namaToko: req.body.namaToko,
                address: alamat._id,
                userId: req.body.id,
                detail: req.body.vendorId
            }, {new: true});

            return res.status(201).json({message: "Berhasil mengubah data Toko", data: newDataToko})
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}
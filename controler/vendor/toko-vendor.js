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
                },
                userId: req.body.id,
                isStore: true
            })
            const newDataToko = await Toko.create({
                userId: req.body.id,
                detailId: req.body.detailId,
                namaToko: req.body.namaToko,
                address: alamat._id,
                userId: req.body.id,
            });

            return res.status(201).json({message: "Berhasil mengubah data Toko", data: newDataToko})
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    
    getDetailToko: async(req, res, next) => {
        try {
            const dataToko = await Toko.findOne({userId: req.params.id});
            if(!dataToko) return res.status(404).json({message: `Toko dengan userId: ${req.params.id} tidak ditemukan`});
            return res.status(200).json({message: "Berhasil Mendapatkan Data Toko", data: dataToko})
        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    updateDetailToko: async(req, res, next) => {
        try {
            const updatedToko = await Toko.findOneAndUpdate({userId: req.user.id}, req.body, { new: true });
            if(!updatedToko) return res.status(404).json({message: "Kamu tidak mempunyai Toko"});
            return res.status(201).json({message: "Berhasil Memperbarui Data Toko", data: updatedToko})
        } catch (error) {
            console.log(error);
            next(error);
        }
    }
}
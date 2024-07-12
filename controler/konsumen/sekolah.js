const Address = require("../../models/model-address");
const Sekolah = require("../../models/model-sekolah");

module.exports = {
    createSekolah: async (req, res, next) => {
        try {
            const { 
                konsumenId, 
                province, 
                regency, 
                district,
                village,
                code_pos,
                address_description,
                long_pin_alamat,
                lat_pin_alamat
            } = req.body

            const alamat = await Address.create({
                province,
                regency,
                district,
                village,
                code_pos,
                address_description,
                pinAlamat: {
                    long: long_pin_alamat,
                    lat: lat_pin_alamat
                },
                userId: req.user.id
            });

            const sekolah = await Sekolah.create({
                userId: req.user.id,
                detailId: konsumenId,
                address: alamat._id,
                ...req.body
            });

            return res.status(201).json({message: "Berhasil Menambahkan Sekolah", data: sekolah })
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}
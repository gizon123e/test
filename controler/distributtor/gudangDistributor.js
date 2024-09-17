const GudangDistributor = require('../../models/distributor/gudangDistributor')
const Address = require('../../models/model-address')
const cekLokasiLatLog = require('../../utils/cek-alamat')

module.exports = {
    getAllGudangDistributor: async (req, res, next) => {
        try {
            const gudangDistributor = await GudangDistributor.find()

            res.status(200).json({ message: "get all success", datas: gudangDistributor })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    createGudangPengiriman: async (req, res, next) => {
        try {
            const { province, regency, district, village, code_pos, address_description, long_pin_alamat, lat_pin_alamat, userId, nama_toko, id_distributor } = req.body

            // Cek validasi latitude dan longitude
            const lokasiValidasi = cekLokasiLatLog(lat_pin_alamat, long_pin_alamat);
            if (!lokasiValidasi.valid) {
                return res.status(400).json({ message: lokasiValidasi.message });
            }

            const address = {
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
                isMain: true,
                isUsed: true
            };

            const newAddress = await Address.create({ ...address, userId });

            const datas = await GudangDistributor.create({ nama_toko, id_distributor, alamat_id: newAddress._id })

            res.status(201).json({ message: 'create data success', datas })
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
}
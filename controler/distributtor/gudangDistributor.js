const GudangDistributor = require('../../models/distributor/gudangDistributor')
const Address = require('../../models/model-address')

module.exports = {
    getAllGudangDistributor: async (req, res, next) => {
        const gudangDistributor = await GudangDistributor.find()

        res.status(200).json({ message: "get all success", datas: gudangDistributor })
    },

    createGudangPengiriman: async (req, res, next) => {
        const { province, regency, district, village, code_pos, address_description, long_pin_alamat, lat_pin_alamat, userId, nama_toko, id_distributor } = req.body

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
            isMain: true
        };

        const newAddress = await Address.create({ ...address, userId });

        const datas = await GudangDistributor.create({ nama_toko, id_distributor, alamat_id: newAddress._id })

        res.status(201).json({ message: 'create data success', datas })
    }
}
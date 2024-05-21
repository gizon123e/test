const Address = require('../models/models-address')

module.exports = {
    getAddress: async (req, res, next) => {
        try {
            const dataAddress = await Address.find({ userId: req.user.id })
            if(!dataAddress || dataAddress.length === 0) return res.status(404).json({message: "User tidak memiliki alamat"})
            return res.status(200).json({ message: 'get data all Address success', datas: dataAddress })
        } catch (error) {
            console.log(error)
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                })
            }
            next(error)
        }
    },

    createAddress: async (req, res, next) => {
        try {
            const { label, province, regency, district, village, code_pos, address_description, long_pin_alamat, lat_pin_alamat } = req.body

            const dataAddress = await Address.create({ 
                label_alamat: label,
                province, 
                regency, 
                district, 
                village, 
                code_pos, 
                address_description, 
                userId: req.user.id,
                pinAlamat:{
                    long: long_pin_alamat,
                    lat: lat_pin_alamat
                }
            })
            return res.status(201).json({ message: 'create data address success', datas: dataAddress })
        } catch (error) {
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                })
            };
            console.log(error);
            next(error);
        }
    },

    updateAddress: async (req, res, next) => {
        try {
            const address = await Address.findById(req.params.id);
            if(address.isMain) return res.status(403).json({message: "Tidak Bisa Mengubah Alamat Utama, Silahkan hubungi Customer Service untuk mengubah"})
            const { province, regency, district, village, code_pos, address_description, long_pin_alamat, lat_pin_alamat } = req.body
            const dataAddress = await Address.findByIdAndUpdate({ _id: req.params.id }, { 
                province, 
                regency, 
                district, 
                village, 
                code_pos, 
                address_description, 
                pinAlamat:{
                    long: long_pin_alamat,
                    lat: lat_pin_alamat
                }
            }, { new: true })
            return res.status(201).json({ message: 'edit data address success', datas: dataAddress })
        } catch (error) {
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                })
            }
            console.log(error)
            next(error)
        }
    },

    deleteAddress: async (req, res, next) => {
        try {
            const dataAddress = await Address.findOne({ _id: req.params.id })
            if (!dataAddress) return res.status(404).json({ message: 'delete data address not found' })

            await Address.deleteOne({ _id: req.params.id })
            return res.status(200).json({ message: 'delete data success' })
        } catch (error) {
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                })
            }
            next(error)
        }
    }
}
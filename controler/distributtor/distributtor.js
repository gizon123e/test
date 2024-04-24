const Distributtor = require('../../models/distributtor/model-distributtor')
const path = require('path')
const fs = require('fs')

module.exports = {
    getAllDistributtor: async (req, res, next) => {
        try {
            if (req.user.role === 'distributtor') {
                const dataDistributtor = await Distributtor.find({ userId: req.user.id }).populate('userId', '-password').populate('addressId')

                if (!dataDistributtor) return res.status(200).json({ message: 'anda belom punya data Distributtor' })

                return res.status(200).json({
                    message: 'get data all distributtor success',
                    datas: dataDistributtor
                })
            }
            const dataDistributtor = await Distributtor.find().populate('userId', '-password').populate('addressId')
            return res.status(200).json({
                message: 'get data all distributtor success',
                datas: dataDistributtor
            })
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
    },

    getDetailDistributtor: async (req, res, next) => {
        try {
            const dataDistributtor = await Distributtor.findOne({ _id: req.params.id }).populate('userId', '-password').populate('addressId')
            if (!dataDistributtor) return res.status(404).json({ error: `data Distriuttor id :${req.params.id} not Found` })

            res.status(200).json({ message: 'success', datas: dataDistributtor })
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
    },

    createDistributtor: async (req, res, next) => {
        try {
            if(req.user.role != "distributor") return res.status(403).json({message:"User bukan distributor!"});

            const { name_kantor, no_telepon, armada_pengiriman, name_penanggung_jawab, nik_ktp, addressId, jam_oprasi, harga_ongkir } = req.body;
            const { image_ktp, image_sim } = req.files;

            const regexNoTelepon = /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/
            if (!regexNoTelepon.test(no_telepon.toString())) {
                return res.status(400).json({ error: 'no telepon tidak valid' })
            }

            const ktpFileName = `${Date.now()}_${image_ktp.name}`;
            const simFileName = `${Date.now()}_${image_sim.name}`;

            const ktpImagePath = path.join(__dirname, '../../public', 'image-ktp', ktpFileName);
            const simImagePath = path.join(__dirname, '../../public', 'image-sim', simFileName);

            await image_ktp.mv(ktpImagePath);
            await image_sim.mv(simImagePath)

            const dataDistributtor = await Distributtor.create({
                userId: req.user.id,
                name_kantor,
                no_telepon,
                armada_pengiriman,
                name_penanggung_jawab,
                nik_ktp,
                addressId,
                jam_oprasi,
                harga_ongkir,
                image_ktp: `${req.protocol}://${req.get('host')}/public/image-ktp/${ktpFileName}`,
                image_sim: `${req.protocol}://${req.get('host')}/public/image-sim/${simFileName}`,
            });

            res.status(201).json({
                message: 'Distributtor created with KTP and SIM images',
                data: dataDistributtor
            })

        } catch (error) {
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                })
            }

            next(error);
        }
    },

    updateDistributtor: async (req, res, next) => {
        try {
            const { name_kantor, no_telepon, armada_pengiriman, name_penanggung_jawab, nik_ktp, addressId, harga_ongkir, jam_oprasi } = req.body
            const { image_ktp, image_sim } = req.files;

            const regexNoTelepon = /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/
            if (!regexNoTelepon.test(no_telepon.toString())) {
                return res.status(400).json({ error: 'no telepon tidak valid' })
            }

            // delete image sim
            const detailDistributtor = await Distributtor.findOne({ _id: req.params.id })
            if (!detailDistributtor) return res.status(404).json({ error: 'data distributtor not found' })

            const fileNameImageSim = detailDistributtor.image_sim.substring(detailDistributtor.image_sim.lastIndexOf('/') + 1);
            const deleteImageSim = path.join(__dirname, '../../public', 'image-sim', fileNameImageSim);
            if (fs.existsSync(deleteImageSim)) {
                fs.unlinkSync(deleteImageSim);
            }

            // delete image ktp
            const fileNameImageKtp = detailDistributtor.image_ktp.substring(detailDistributtor.image_ktp.lastIndexOf('/') + 1);
            const deleteImagektp = path.join(__dirname, '../../public', 'image-ktp', fileNameImageKtp);
            if (fs.existsSync(deleteImagektp)) {
                fs.unlinkSync(deleteImagektp);
            }

            // update image
            const ktpFileName = `${Date.now()}_${image_ktp.name}`;
            const simFileName = `${Date.now()}_${image_sim.name}`;

            const ktpImagePath = path.join(__dirname, '../../public', 'image-ktp', ktpFileName);
            const simImagePath = path.join(__dirname, '../../public', 'image-sim', simFileName);

            await image_ktp.mv(ktpImagePath);
            await image_sim.mv(simImagePath)

            const updateData = {
                name_kantor,
                no_telepon,
                armada_pengiriman,
                name_penanggung_jawab,
                nik_ktp,
                addressId,
                harga_ongkir,
                jam_oprasi,
                image_ktp: `${req.protocol}://${req.get('host')}/public/image-ktp/${ktpFileName}`,
                image_sim: `${req.protocol}://${req.get('host')}/public/image-sim/${simFileName}`,
            };

            const updatedDistributtor = await Distributtor.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true }
            );

            if (!updatedDistributtor) {
                return res.status(404).json({ error: `Data distributtor with ID ${req.params.id} not found` });
            }

            res.status(200).json({
                message: 'Distributtor updated successfully',
                data: updatedDistributtor
            });
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
    },

    deleteDistributtor: async (req, res, next) => {
        try {
            const dataDistributtor = await Distributtor.findOne({ _id: req.params.id })
            if (!dataDistributtor) {
                return res.status(404).json({ error: `data id ${req.params.id} not found` })
            }

            await Distributtor.deleteOne({ _id: req.params.id })

            return res.status(200).json({ message: 'delete data Distributtor success' })
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
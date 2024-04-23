const multer = require('multer')
const Distributtor = require('../../models/distributtor/model-distributtor')
const { updateImage } = require('../../utils/image-multer')
const upload = require('../../utils/image-multer')

module.exports = {
    getAllDistributtor: async (req, res, next) => {
        try {
            if (req.user.role === 'distributtor') {
                const dataDistributtor = await Distributtor.find({ userId: req.user.id }).populate('userId', '-password').populate('addressId')
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

    createDistributtor: async (req, res, next) => {
        try {
            upload.upload.fields([
                { name: 'image_ktp', maxCount: 1 },
                { name: 'image_sim', maxCount: 1 }
            ])(req, res, async (err) => {
                if (err instanceof multer.MulterError) {
                    return res.status(400).json({ error: err.message });
                } else if (err) {
                    return res.status(400).json({ error: err.message });
                }

                const { name_kantor, no_telepon, armada_pengiriman, name_penanggung_jawab, nik_ktp, addressId, jam_oprasi, harga_ongkir } = req.body;
                const { image_ktp, image_sim } = req.files;

                if (!image_ktp || !image_sim) {
                    return res.status(400).json({ error: 'Both KTP and SIM images are required' });
                }

                const dataDistributtor = await Distributtor.create({
                    userId: req.user.id,
                    name_kantor,
                    no_telepon,
                    armada_pengiriman,
                    name_penanggung_jawab,
                    nik_ktp,
                    image_ktp: image_ktp[0].filename,
                    image_sim: image_sim[0].filename,
                    addressId,
                    jam_oprasi,
                    harga_ongkir
                });

                res.status(201).json({
                    message: 'Distributtor created with KTP and SIM images',
                    data: dataDistributtor
                });
            });
        } catch (error) {
            next(error);
        }
    },

    updateDistributtor: async (req, res, next) => {
        try {
            const { name_kantor, no_telepon, armada_pengiriman, name_penanggung_jawab, nik_ktp, addressId, harga_ongkir, jam_oprasi } = req.body

            // const regexNoTelepon = /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/
            // if (!regexNoTelepon.test(no_telepon.toString())) {
            //     return res.status(400).json({ error: 'no telepon tidak valid' })
            // }

            console.log(no_telepon)

            let updateData = {
                name_kantor,
                no_telepon,
                armada_pengiriman,
                name_penanggung_jawab,
                nik_ktp,
                addressId,
                harga_ongkir,
                jam_oprasi
            };

            // const { image_ktp, image_sim } = req.files;

            console.log(req.files)

            // Update image_ktp
            if (req.files && req.files['image_ktp'] && req.files['image_ktp'].length > 0) {
                updateData.image_ktp = await updateImage(req, 'image_ktp', req.body.old_image_ktp);
            }

            // Update image_sim
            if (req.files && req.files['image_sim'] && req.files['image_sim'].length > 0) {
                updateData.image_sim = await updateImage(req, 'image_sim', req.body.old_image_sim);
            }

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
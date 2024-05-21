const DokumenPenanggungJawab = require('../../models/distributor/model-documenPenanggungJawab')
const path = require('path')
const fs = require('fs')
const { updateDocumentDistributtor } = require('./documentDistributtor')

module.exports = {
    getDocumentPenanggungJawab: async (req, res, next) => {
        try {
            const data = await DokumenPenanggungJawab.find()
            if (!data) return res.status(400).json({ message: "anda elom mengisis data dokument penanggung jawab" })

            res.status(200).json({
                message: "get data success",
                data
            })
        } catch (error) {
            console.error("Error creating document:", error);
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                });
            }
            next(error);
        }
    },

    getDocumentPenanggungJawabById: async (req, res, next) => {
        try {
            const data = await DokumenPenanggungJawab.findOne({ _id: req.params.id })
            if (!data) return res.status(404).json({ message: "data Not Found" })

            res.status(200).json({
                message: "get data by id success",
                data
            })
        } catch (error) {
            console.error("Error creating document:", error);
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                });
            }
            next(error);
        }
    },

    createDocumentPenanggungJawab: async (req, res, next) => {
        try {
            const { id_penanggung_jawab_distributor, nik, } = req.body
            const files = req.files;
            const ktp = files ? files.ktp : null;
            const npwp = files ? files.npwp : null;

            if (!nib || !npwp) {
                return res.status(400).json({ message: "kamu gagal masukan file nib & npwp" });
            }

            const legalitasKtp = `${Date.now()}${path.extname(ktp.name)}`;
            const fileKtp = path.join(__dirname, '../../public/image-ktp', legalitasKtp);

            ktp.mv(fileKtp, (err) => {
                if (err) {
                    return res.status(500).json({ message: "Failed to upload NIB file", error: err });
                }
            });

            const legalitasNpwp = `${Date.now()}${path.extname(npwp.name)}`;
            const fileNpwp = path.join(__dirname, '../../public/image-npwp', legalitasNpwp);

            npwp.mv(fileNpwp, (err) => {
                if (err) {
                    return res.status(500).json({ message: "Failed to upload NPWP file", error: err });
                }
            });

            const data = await DokumenDistributor.create({
                id_penanggung_jawab_distributor,
                nik,
                ktp: `${req.protocol}://${req.get('host')}/public/image-nib/${legalitasKtp}`,
                npwp: `${req.protocol}://${req.get('host')}/public/image-npwp/${legalitasNpwp}`
            });

            res.status(201).json({
                message: 'create data Dokumen success',
                data
            });


        } catch (error) {
            console.error("Error creating document:", error);
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                });
            }
            next(error);
        }
    },

    updateDocumentPenanggungJawab: async (req, res, next) => {
        try {
            const { id_penanggung_jawab_distributor, nik, } = req.body
            const files = req.files;
            const ktp = files ? files.ktp : null;
            const npwp = files ? files.npwp : null;

            if (!ktp || !npwp) {
                return res.status(400).json({ message: "kamu gagal masukan file nib & npwp" });
            }

            const dataDistributtor = await DokumenPenanggungJawab.findOne({ _id: req.params.id })
            if (!dataDistributtor) return res.status(404).json({ message: `data Not Found ${req.params.id}` })

            const nibFilename = path.basename(dataDistributtor.ktp);
            const npwpFilename = path.basename(dataDistributtor.npwp)

            const currentNibPath = path.join(__dirname, '../../public/image-nib', nibFilename);
            const currentNpwpPath = path.join(__dirname, '../../public/image-npwp', npwpFilename);

            // Delete the existing files if they exist
            if (fs.existsSync(currentNibPath)) {
                fs.unlinkSync(currentNibPath);
            }
            if (fs.existsSync(currentNpwpPath)) {
                fs.unlinkSync(currentNpwpPath);
            }

            const legalitasKtp = `${Date.now()}${path.extname(ktp.name)}`;
            const fileKtp = path.join(__dirname, '../../public/image-ktp', legalitasKtp);

            ktp.mv(fileKtp, (err) => {
                if (err) {
                    return res.status(500).json({ message: "Failed to upload NIB file", error: err });
                }
            });

            const legalitasNpwp = `${Date.now()}${path.extname(npwp.name)}`;
            const fileNpwp = path.join(__dirname, '../../public/image-npwp', legalitasNpwp);

            npwp.mv(fileNpwp, (err) => {
                if (err) {
                    return res.status(500).json({ message: "Failed to upload NPWP file", error: err });
                }
            });

            const data = await DokumenDistributor.findByIdAndUpdate({ _id: req.params.id }, {
                id_penanggung_jawab_distributor,
                nik,
                ktp: `${req.protocol}://${req.get('host')}/public/image-nib/${legalitasKtp}`,
                npwp: `${req.protocol}://${req.get('host')}/public/image-npwp/${legalitasNpwp}`
            }, { new: true });

            res.status(201).json({
                message: "update data success",
                data
            })
        } catch (error) {
            console.error("Error creating document:", error);
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                });
            }
            next(error);
        }
    },

    deleteDocumentPenanggungJawab: async (req, res, next) => {
        try {
            const data = await DokumenDistributor.findOne({ _id: req.params.id })
            if (!data) return res.status(404).join({ message: `data Not Found` })
            const nibFilename = path.basename(data.ktp);
            const npwpFilename = path.basename(data.npwp)

            const currentNibPath = path.join(__dirname, '../../public/image-nib', nibFilename);
            const currentNpwpPath = path.join(__dirname, '../../public/image-npwp', npwpFilename);

            // Delete the existing files if they exist
            if (fs.existsSync(currentNibPath)) {
                fs.unlinkSync(currentNibPath);
            }
            if (fs.existsSync(currentNpwpPath)) {
                fs.unlinkSync(currentNpwpPath);
            }

            await DokumenDistributor.deleteOne({ _id: req.params.id })

            res.status(200).json({ message: "delete data success" })
        } catch (error) {
            console.error("Error creating document:", error);
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                });
            }
            next(error);
        }
    }
}

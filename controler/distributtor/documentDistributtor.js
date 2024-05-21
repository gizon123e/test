const DokumenDistributor = require('../../models/distributor/model-Dokumen-Distributor')
const path = require("path")
const fs = require('fs')

module.exports = {
    getDataDocumentDistributtor: async (req, res, next) => {
        try {
            const data = await DokumenDistributor.find().populate("id_distributor");

            // if (!data) return res.status(400).json({ message: "kamu belom mengisi data dokument distributtor" })

            res.status(200).json({
                message: "get data success",
                data
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

    getDataDocumentDistributtorById: async (req, res, next) => {
        try {
            const data = await DokumenDistributor.findOne({ _id: req.params.id }).populate('id_distributor').populate("userId", '-password')
            if (!data) return res.status(404).json({ message: `data Document Distributtor ${req.params.id} Not Found` })

            res.status(200).json({
                message: "get data Document Distributtor by id Success",
                data
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

    createDocumentDistributtor: async (req, res, next) => {
        try {
            const { id_distributor, no_akta } = req.body;
            const files = req.files;
            const nib = files ? files.nib : null;
            const npwp = files ? files.npwp : null;

            if (!nib || !npwp) {
                return res.status(400).json({ message: "kamu gagal masukan file nib & npwp" });
            }

            const legalitasNib = `${Date.now()}${path.extname(nib.name)}`;
            const fileNib = path.join(__dirname, '../../public/image-nib', legalitasNib);

            nib.mv(fileNib, (err) => {
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
                id_distributor,
                no_akta,
                nib: `${req.protocol}://${req.get('host')}/public/image-nib/${legalitasNib}`,
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

    updateDocumentDistributtor: async (req, res, next) => {
        try {
            const { id_distributor, no_akta } = req.body;
            const files = req.files;
            const nib = files ? files.nib : null;
            const npwp = files ? files.npwp : null;

            if (!nib || !npwp) {
                return res.status(400).json({ message: "kamu gagal masukan file nib & npwp" });
            }
            console.log(id_distributor, no_akta)

            const dataDistributtor = await DokumenDistributor.findOne({ _id: req.params.id })
            if (!dataDistributtor) return res.status(404).json({ message: `data Not Found ${req.params.id}` })
            const nibFilename = path.basename(dataDistributtor.nib);
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

            const legalitasNib = `${Date.now()}${path.extname(nib.name)}`;
            const fileNib = path.join(__dirname, '../../public/image-nib', legalitasNib);

            nib.mv(fileNib, (err) => {
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
                id_distributor,
                no_akta,
                nib: `${req.protocol}://${req.get('host')}/public/image-nib/${legalitasNib}`,
                npwp: `${req.protocol}://${req.get('host')}/public/image-npwp/${legalitasNpwp}`
            }, { new: true });

            res.status(201).json({
                message: 'update data Dokumen success',
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

    deleteDocumentDistributtor: async (req, res, next) => {
        try {
            const data = await DokumenDistributor.findOne({ _id: req.params.id })
            if (!data) return res.status(404).join({ message: `data Not Found` })
            const nibFilename = path.basename(data.nib);
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
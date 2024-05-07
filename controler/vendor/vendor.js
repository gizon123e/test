const Vendor = require('../../models/vendor/model-vendor')
const path = require('path')
const fs = require('fs')

module.exports = {

    getAllVendor: async (req, res, next) => {
        try {
            const dataVendor = await Vendor.find().populate('userId', '-password').populate('addressId')
            return res.status(200).json({
                message: 'get data all vendor success',
                datas: dataVendor
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

    getDetailVendor: async (req, res, next) => {
        try {
            const dataVendor = await Vendor.findOne({userId: req.user.id}).populate('userId', '-password').populate('addressId')
            if (!dataVendor) return res.status(404).json({ error: `data Vendor id :${req.params.id} not Found` })

            res.status(200).json({ message: 'success', datas: dataVendor })
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

    createVendor: async (req, res, next) => {
        try {
            if(req.user.role != "vendor") return res.status(403).json({message:"User bukan vendor!"});

            const samaUser = await Vendor.findOne({userId: req.user.id});

            if(samaUser) return res.status(400).json({message: "User ini sudah memiliki data detail vendor", data: samaUser});

            const { nama, namaBadanUsaha, penanggungJawab, noTeleponKantor, registerAs, addressId } = req.body;
            
            if(!addressId) return res.status(400).json({message: "Harus ada alamat"});

            if(registerAs === "not_individu" && (!namaBadanUsaha || !penanggungJawab || !noTeleponKantor || !req.files)){
                return res.status(403).json({message: "Jika daftar sebagai bukan individu, wajib mengisi namaBadanUsaha, penanggungJawab, noTeleponKantor, dan file legalitas badan usaha dengan nama legalitasBadanUsaha"});
            };
            
            
            if(registerAs === "individu" && (namaBadanUsaha || noTeleponKantor || penanggungJawab || req.files)) return res.status(400).json({message:"Jika daftar sebagai individu payload yang dibutuhkan cuman nama, dan addressId"});
            
            async function dataMake(){
                if(registerAs === "not_individu"){
                    const { legalitasBadanUsaha } = req.files;
                    const regexNoTelepon = /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/;
                    if (!regexNoTelepon.test(noTeleponKantor.toString())) {
                        return res.status(400).json({ error: 'no telepon tidak valid' });
                    };

                    
                    const legalitasFile = `${Date.now()}_${req.user.name}_${path.extname(legalitasBadanUsaha.name)}`;
                    
                    const legalitasPath = path.join(__dirname, '../../public', 'legalitas-img', legalitasFile);
                    
                    await legalitasBadanUsaha.mv(legalitasPath);
                    return {
                        userId: req.user.id,
                        namaBadanUsaha,
                        penanggungJawab,
                        noTeleponKantor,
                        addressId,
                        legalitasBadanUsaha: `${req.protocol}://${req.get('host')}/public/legalitas-img/${legalitasFile}`,
                    };
                };

                if(registerAs !== "not_individu"){
                    return {
                        userId: req.user.id,
                        nama,
                        addressId,
                    };
                };
            }
            const data = await dataMake();
            
            const dataVendor = await Vendor.create(data);

            res.status(201).json({
                message: 'Vendor Successfully Created',
                data: dataVendor
            });

        } catch (error) {
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                });
            };

            next(error);
        }
    },

    updateVendor: async (req, res, next) => {
        try {
            const id = req.params.id
            const vendor = await Vendor.findById(id);
            if(!vendor) return res.status(404).json({message: `Vendor dengan id ${id} tidak ditemukan`});
            let filePath = vendor.legalitasBadanUsaha
            if(req.body.noTeleponKantor){
                const regexNoTelepon = /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/
                if (!regexNoTelepon.test(req.body[noTeleponKantor].toString())) {
                    return res.status(400).json({ error: 'no telepon tidak valid' })
                }
            }

            if(req.files && req.files.legalitasBadanUsaha){
                const name = vendor.legalitasBadanUsaha.split('/')
                if(fs.existsSync(path.join(__dirname, '../../public', 'legalitas-img', name[5]))){
                    fs.unlink(path.join(__dirname, '../../public', 'legalitas-img', name[5]), (err) => {
                        if (err) {
                            console.error('Error while deleting file:', err);
                        } else {
                            console.log('File deleted successfully');
                        }
                    });
                }
                const legalitasFile = `${Date.now()}_${req.user.name}_${path.extname(req.files.legalitasBadanUsaha.name)}`;
                    
                const legalitasPath = path.join(__dirname, '../../public', 'legalitas-img', legalitasFile);
                filePath = `${req.protocol}://${req.get('host')}/public/legalitas-img/${legalitasFile}`
                await req.files.legalitasBadanUsaha.mv(legalitasPath);
            }


            const updatedVendor = await Vendor.findByIdAndUpdate(
                id,
                { ...req.body, legalitasBadanUsaha: filePath },
                { new: true }
            );

            res.status(200).json({
                message: 'Vendor updated successfully',
                data: updatedVendor
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

    deleteVendor: async (req, res, next) => {
        try {
            const dataVendor = await Vendor.findByIdAndDelete(req.params.id)
            if (!dataVendor) {
                return res.status(404).json({ error: `data id ${req.params.id} not found` })
            }
            return res.status(200).json({ message: 'delete data Vendor success' })
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
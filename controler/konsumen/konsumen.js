const Konsumen = require('../../models/konsumen/model-konsumen')
const Address = require("../../models/models-address")
const path = require('path');
const dotenv = require('dotenv')
const fs = require('fs')
dotenv.config()

module.exports = {

    getAllKonsumen: async (req, res, next) => {
        try {
            const dataKonsumen = await Konsumen.find().populate('userId', '-password').populate('addressId');
            if(!dataKonsumen || dataKonsumen.length === 0) return res.status(404).json({message: "Tidak ada Konsumen terdaftar"});
            return res.status(200).json({
                message: 'get data all Konsumen success',
                datas: dataKonsumen
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

    getDetailKonsumen: async (req, res, next) => {
        try {
            const dataKonsumen = await Konsumen.findOne({userId: req.user.id}).populate('userId', '-password')

            if (!dataKonsumen) return res.status(404).json({ error: `data Konsumen id :${req.params.id} not Found` });

            res.status(200).json({ message: 'success', datas: dataKonsumen })
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

    createKonsumen: async (req, res, next) => {
        try {
            // if(req.user.role != "konsumen") return res.status(403).json({message:"User bukan konsumen!"});
            const samaUser = await Konsumen.findOne({userId: req.body.id}).populate('userId', '-password');

            if(samaUser) return res.status(400).json({message: "User ini sudah memiliki data detail Konsumen", data: samaUser});

            const { nama, namaBadanUsaha, penanggungJawab, noTeleponKantor, registerAs, province, subdistrict, regency, village, code_pos, address_description } = req.body;
            
            const address = {
                province,
                subdistrict,
                regency,
                village,
                code_pos,
                address_description
            };

            if(registerAs === "not_individu" && (!namaBadanUsaha || !penanggungJawab || !noTeleponKantor || !req.files)){
                return res.status(403).json({message: "Jika daftar sebagai bukan individu, wajib mengisi namaBadanUsaha, penanggungJawab, noTeleponKantor, dan file legalitas badan usaha dengan nama legalitasBadanUsaha"});
            };
            
            
            if(registerAs === "individu" && (namaBadanUsaha || noTeleponKantor || penanggungJawab || req.files)) return res.status(400).json({message:"Jika daftar sebagai individu payload yang dibutuhkan cuman nama, dan addressId"});
            
            const newAddress = await Address.create({...address, userId: req.body.id});
            async function dataMake(){
                if(registerAs === "not_individu"){
                    const { legalitasBadanUsaha } = req.files;
                    const regexNoTelepon = /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/;
                    if (!regexNoTelepon.test(noTeleponKantor.toString())) {
                        return res.status(400).json({ error: 'no telepon tidak valid' });
                    };

                    
                    const legalitasFile = `${Date.now()}_${namaBadanUsaha}_${path.extname(legalitasBadanUsaha.name)}`;
                    
                    const legalitasPath = path.join(__dirname, '../../public', 'legalitas-img', legalitasFile);
                    
                    await legalitasBadanUsaha.mv(legalitasPath);
                    return {
                        userId: req.body.id,
                        namaBadanUsaha,
                        penanggungJawab,
                        noTeleponKantor,
                        address: newAddress._id,
                        legalitasBadanUsaha: `${req.protocol}://${req.get('host')}/public/legalitas-img/${legalitasFile}`,
                    };
                };

                if(registerAs !== "not_individu"){
                    return {
                        userId: req.body.id,
                        nama,
                        address,
                    };
                };
            }
            const data = await dataMake();
            
            const dataKonsumen = await Konsumen.create(data);

            res.status(200).json({
                message: 'Konsumen Successfully Created',
                data: dataKonsumen
            });

        } catch (error) {
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                });
            };
            console.log(error)
            next(error);
        }
    },

    updateKonsumen: async (req, res, next) => {
        try {
            const konsumen = await Konsumen.findOne({userId: req.user.id});

            if(!konsumen) return res.status(404).json({message: `User belum mengisi detail`});
            if(!req.files || !req.files.profile_pict) return res.status(400).json({message: "Foto Profile Kosong!"})
            let filePath = konsumen.profile_pict;
            // if(req.body.noTeleponKantor){
            //     const regexNoTelepon = /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/
            //     if (!regexNoTelepon.test(req.body[noTeleponKantor].toString())) {
            //         return res.status(400).json({ error: 'no telepon tidak valid' })
            //     }
            // }

            if(req.files && req.files.profile_pict){
                const name = konsumen.profile_pict.split('/')
                if(fs.existsSync(path.join(__dirname, '../../public', 'profile_picts', name[5]))){
                    fs.unlink(path.join(__dirname, '../../public', 'profile_picts', name[5]), (err) => {
                        if (err) {
                            console.error('Error while deleting file:', err);
                        } else {
                            console.log('File deleted successfully');
                        }
                    });
                }
                const profile_pict_file = `${Date.now()}_${konsumen.namaBadanUsaha || konsumen.nama}_${path.extname(req.files.profile_pict.name)}`;
                    
                const profile_pict = path.join(__dirname, '../../public', 'profile_picts', profile_pict_file);
                filePath = `${process.env.HOST}/public/profile_picts/${profile_pict_file}`;
                await req.files.profile_pict.mv(profile_pict);
            }


            const updatedData = await Konsumen.findOneAndUpdate({userId: req.user.id}, { profile_pict: filePath }, {new: true});

            res.status(200).json({
                message: 'Konsumen updated successfully',
                data: updatedData
            });
        } catch (error) {
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                });
            };
            console.log(error);
            next(error);
        }
    },

    deleteKonsumen: async (req, res, next) => {
        try {
            const dataKonsumen = await Konsumen.findByIdAndDelete(req.params.id)
            if (!dataKonsumen) {
                return res.status(404).json({ error: `data id ${req.params.id} not found` })
            }
            return res.status(200).json({ message: 'delete data Konsumen success' })
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
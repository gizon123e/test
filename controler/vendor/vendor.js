const Vendor = require('../../models/vendor/model-vendor');
const Address = require("../../models/model-address");
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
            const samaUser = await Vendor.findOne({userId: req.body.id}).populate({
                path: 'userId',
                select: '-password -codeOtp -saldo'
            });

            if(samaUser) return res.status(400).json({message: "User ini sudah memiliki data detail Vendor", data: samaUser});

            const { 
                nama, 
                namaBadanUsaha,
                nomorAktaPerusahaan,
                noTeleponKantor,
                registerAs,
                province, 
                regency, 
                district, 
                village, 
                code_pos, 
                address_description,
                long_pin_alamat,
                lat_pin_alamat,
                nomorNpwpPerusahaan,
                nik,
                nomorNpwp
            } = req.body;
            
            const address = {
                province,
                regency,
                district,
                village,
                code_pos,
                address_description,
                pinAlamat:{
                    long: long_pin_alamat,
                    lat: lat_pin_alamat
                },
                isMain: true
            };
            
            if (registerAs === "not_individu") {
                let missingFields = [];
                if (!namaBadanUsaha) missingFields.push("namaBadanUsaha");
                if (!nomorAktaPerusahaan) missingFields.push("nomorAktaPerusahaan");
                if (!noTeleponKantor) missingFields.push("noTeleponKantor");
                if (!req.files?.legalitasBadanUsaha) missingFields.push("legalitasBadanUsaha");
                if (!req.files?.npwpFile) missingFields.push("npwpFile");
                if (!province) missingFields.push("province");
                if (!regency) missingFields.push("regency");
                if (!district) missingFields.push("district");
                if (!village) missingFields.push("village");
                if (!code_pos) missingFields.push("code_pos");
                if (!address_description) missingFields.push("address_description");
                if (!long_pin_alamat) missingFields.push("long_pin_alamat");
                if (!lat_pin_alamat) missingFields.push("lat_pin_alamat");
                if (!nomorNpwpPerusahaan) missingFields.push("nomorNpwpPerusahaan");
            
                if (missingFields.length > 0) {
                    return res.status(403).json({
                        message: "Data Kurang Lengkap",
                        missingFields: missingFields
                    });
                }
            }
            
            
            if (registerAs === "individu") {
                let missingFields = [];
            
                if (namaBadanUsaha) missingFields.push("Nama Badan Usaha tidak seharusnya diisi");
                if (nomorAktaPerusahaan) missingFields.push("Nomor Akta Perusahaan tidak seharusnya diisi");
                if (noTeleponKantor) missingFields.push("Nomor Telepon Kantor tidak seharusnya diisi");
                if (nomorNpwpPerusahaan) missingFields.push("Nomor NPWP Perusahaan tidak seharusnya diisi");
                if (req.files?.legalitasBadanUsaha) missingFields.push("Legalitas Badan Usah tidak seharusnya diisi");
                if (!nama) missingFields.push("Nama");
                if (!province) missingFields.push("Province");
                if (!regency) missingFields.push("Regency");
                if (!district) missingFields.push("District");
                if (!village) missingFields.push("Village");
                if (!code_pos) missingFields.push("Kode Pos");
                if (!address_description) missingFields.push("Deskripsi Alamat");
                if (!long_pin_alamat) missingFields.push("Longitude Alamat");
                if (!lat_pin_alamat) missingFields.push("Latitude Alamat");
                if (!nik) missingFields.push("NIK");
                if (!req.files?.file_ktp) missingFields.push("File KTP");
                if (req.files?.npwpFile && !nomorNpwp) missingFields.push("Nomor NPWP");
                if (!req.files?.npwpFile && nomorNpwp) missingFields.push("File NPWP");

            
                if (missingFields.length > 0) {
                    return res.status(400).json({
                        message: "Data yang dikirim kurang baik",
                        missingFields
                    });
                }
            }
            
            const newAddress = await Address.create({...address, userId: req.body.id});
            async function dataMake(){
                if(registerAs === "not_individu"){
                    const { legalitasBadanUsaha, npwpFile } = req.files;
                    
                    const legalitasFile = `${Date.now()}_${namaBadanUsaha}_${path.extname(legalitasBadanUsaha.name)}`;
                    
                    const legalitasPath = path.join(__dirname, '../../public', 'legalitas-img', legalitasFile);
                    
                    await legalitasBadanUsaha.mv(legalitasPath);

                    const npwp_file = `${Date.now()}_${namaBadanUsaha}_${path.extname(npwpFile.name)}`;
                    
                    const npwp_file_path = path.join(__dirname, '../../public', 'npwp-img', npwp_file);
                    
                    await npwpFile.mv(npwp_file_path);
                    return {
                        userId: req.body.id,
                        nomorAktaPerusahaan,
                        noTeleponKantor,
                        address: newAddress._id,
                        nomorNpwpPerusahaan,
                        namaBadanUsaha,
                        pinAlamat:{
                            long: long_pin_alamat,
                            lat: lat_pin_alamat
                        },
                        npwpFile: `${process.env.HOST}/public/npwp-img/${npwp_file}`,
                        legalitasBadanUsaha: `${process.env.HOST}/public/legalitas-img/${legalitasFile}`,
                    };
                };

                if(registerAs === "individu"){
                    const { npwpFile, file_ktp } = req.files
                    let npwp_file
                    if(npwpFile){
                        npwp_file = `${Date.now()}_${nama}_${path.extname(npwpFile.name)}`;
                    
                        const npwp_file_path = path.join(__dirname, '../../public', 'npwp-img', npwp_file);
                    
                        await npwpFile.mv(npwp_file_path);
                    }
                    const fileKtp = `${Date.now()}_ktp_of_${nama}_${path.extname(file_ktp.name)}`;
                    const file_file_path = path.join(__dirname, '../../public', 'image-ktp', fileKtp);
                    await file_ktp.mv(file_file_path)
                    return {
                        userId: req.body.id,
                        nama,
                        address: newAddress._id,
                        pinAlamat:{
                            long: long_pin_alamat,
                            lat: lat_pin_alamat
                        },
                        file_ktp: `${process.env.HOST}/public/image-ktp/${fileKtp}`,
                        nomorNpwp: req.body.nomorNpwp? req.body.nomorNpwp : undefined,
                        npwpFile: npwpFile? `${process.env.HOST}/public/npwp-img/${npwp_file}` : undefined,
                    };
                };
            }
            const data = await dataMake();
            
            const dataVendor = await Vendor.create(data);

            return res.status(200).json({
                message: 'Vendor Successfully Created',
                data: dataVendor
            });

        } catch (error) {
            console.log(error)
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
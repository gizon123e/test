const Produsen = require('../../models/produsen/model-produsen');
const Address = require("../../models/model-address");
const path = require('path')
const fs = require('fs');
const User = require('../../models/model-auth-user');
const PicProdusen = require('../../models/produsen/model-penanggung-jawab');

module.exports = {

    getAllProdusen: async (req, res, next) => {
        try {
            const dataProdusen = await Produsen.find().populate('userId', '-password').populate('addressId')
            return res.status(200).json({
                message: 'get data all vendor success',
                datas: dataProdusen
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

    getDetailProdusen: async (req, res, next) => {
        try {
            const dataProdusen = await Produsen.findOne({userId: req.user.id}).select("-nomorAktaPerusahaan -file_ktp -nik -npwpFile -nomorNpwpPerusahaan -nomorNpwp -legalitasBadanUsaha").populate('userId', '-password').populate('address').lean()
            let pic;
            if (!dataProdusen) return res.status(404).json({ error: `data Produsen id :${req.user.id} not Found` });
            let modifiedDataProdusen = dataProdusen
            const isIndividu = dataProdusen.nama? true : false
            if(isIndividu){
                pic = null
                modifiedDataProdusen = {
                    ...modifiedDataProdusen,
                    pic
                }
            }
            if(!isIndividu){
                pic = await PicProdusen.findOne({userId: req.user.id, detailId: dataProdusen._id})
                const { namaBadanUsaha, ...rest } = dataProdusen
                modifiedDataProdusen = {
                    ...rest,
                    nama: namaBadanUsaha,
                    pic
                };
            }
            return res.status(200).json({ message: 'success', datas: modifiedDataProdusen, isIndividu })
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

    createProdusen: async (req, res, next) => {
        try {
            const samaUser = await Produsen.findOne({userId: req.body.id}).populate({
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
            
            const dataProdusen = await Produsen.create(data);

            return res.status(200).json({
                message: 'Vendor Successfully Created',
                data: dataProdusen
            });

        } catch (error) {
            console.log(error)
            next(error);
        }
    },

    updateProdusen: async (req, res, next) => {
        try {
            const produsen = await Produsen.findOne({userId: req.user.id});
            if(!produsen) return res.status(404).json({message: `User belum mengisi detail`});
            let filePath = produsen.profile_pict;
            
            // if(req.body.noTeleponKantor){
            //     const regexNoTelepon = /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/
            //     if (!regexNoTelepon.test(req.body[noTeleponKantor].toString())) {
            //         return res.status(400).json({ error: 'no telepon tidak valid' })
            //     }
            // }

            if(req.files && req.files.profile_pict){
                const name = produsen.profile_pict ? produsen.profile_pict.split('/') : "notfound"
                if(fs.existsSync(path.join(__dirname, '../../public', 'profile_picts', name[5]))){
                    console.log('ada')
                    fs.unlink(path.join(__dirname, '../../public', 'profile_picts', name[5]), (err) => {
                        if (err) {
                            console.error('Error while deleting file:', err);
                        } else {
                            console.log('File deleted successfully');
                        }
                    });
                }
                const profile_pict_file = `${produsen.namaBadanUsaha || produsen.nama}_${Date.now()}${path.extname(req.files.profile_pict.name)}`;
                    
                const profile_pict = path.join(__dirname, '../../public', 'profile_picts', profile_pict_file);
                filePath = `${process.env.HOST}public/profile_picts/${profile_pict_file}`;
                await req.files.profile_pict.mv(profile_pict);
            }


            const updatedData = await Produsen.findOneAndUpdate({userId: req.user.id}, { 
                profile_pict: filePath,
                jenis_kelamin: req.body.jenis_kelamin? req.body.jenis_kelamin : undefined,
                jenis_perusahaan: req.body.jenis_perusahaan? req.body.jenis_perusahaan: undefined,
                tanggal_lahir: req.body.tanggal_lahir? req.body.tanggal_lahir : undefined
            }, {new: true});

            if((updatedData.jenis_kelamin || updatedData.jenis_perusahaan) && updatedData.tanggal_lahir){
                await User.updateOne({_id: req.user.id}, {
                    isActive: true
                })
            }

            res.status(200).json({
                message: 'Produsen updated successfully',
                data: updatedData
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

    deleteProdusen: async (req, res, next) => {
        try {
            const dataVendor = await Produsen.findByIdAndDelete(req.params.id)
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
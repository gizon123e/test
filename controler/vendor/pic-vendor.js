const PicVendor = require('../../models/vendor/model-penanggung-jawab');
const Address = require('../../models/model-address');
const dotenv = require('dotenv')
const path = require('path')
dotenv.config()

module.exports = {
    createPic: async(req, res, next)=>{
        try {
            const {nama, detailId, jabatan, id, province, regency, district, village, code_pos, address_description, nik, nomorNpwp, long_pin_alamat, lat_pin_alamat} = req.body
            const picKonsumen = await PicKonsumen.findOne({detailId: req.body.detailId});
            let missingFields = [];
            if (!nama) missingFields.push("nama");
            if (!detailId) missingFields.push("detailId");
            if (!id) missingFields.push("id");
            if (!nik) missingFields.push("nik");
            if (!jabatan) missingFields.push("jabatan");
            if (!nomorNpwp) missingFields.push("nomorNpwp");
            if (!req.files?.file_ktp) missingFields.push("file_ktp");
            if (!req.files?.npwpFile) missingFields.push("npwpFile");
            if (!province) missingFields.push("province");
            if (!regency) missingFields.push("regency");
            if (!district) missingFields.push("district");
            if (!village) missingFields.push("village");
            if (!code_pos) missingFields.push("code_pos");
            if (!address_description) missingFields.push("address_description");

            if (missingFields.length > 0) {
                return res.status(403).json({
                    message: "Data Kurang Lengkap",
                    missingFields: missingFields
                });
            }

            const newAddress = await Address.create({
                province,
                regency,
                district,
                village,
                code_pos,
                address_description,
                userId: id,
                isPic: true,
                pinAlamat:{
                    lat: lat_pin_alamat,
                    long: long_pin_alamat
                }
            })
            if(picKonsumen) return res.status(400).json({message:"Person in charge untuk konsumen id " + req.body.detailId + "sudah ada", data: picKonsumen})
            
            const{npwpFile, file_ktp} = req.files
            const npwp_file = `${Date.now()}_${nama}_PIC_${path.extname(npwpFile.name)}`;        
            const npwp_file_path = path.join(__dirname, '../../public', 'npwp-img', npwp_file);
            const fileKtp = `${Date.now()}_ktp_of_${nama}_${path.extname(file_ktp.name)}`;
            const file_file_path = path.join(__dirname, '../../public', 'image-ktp', fileKtp);
            await file_ktp.mv(file_file_path)
            await npwpFile.mv(npwp_file_path);

            const newPic = await PicKonsumen.create({
                detailId,
                userId: id,
                nama,
                jabatan,
                nomorNpwp,
                nik,
                file_npwp: `${process.env.HOST}/public/npwp-img/${npwp_file}`,
                ktp_file: `${process.env.HOST}/public/image-ktp/${fileKtp}`,
                alamat: newAddress._id
            })

            return res.status(201).json({message: "Berhasil Membuat Pic", data: newPic})
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}
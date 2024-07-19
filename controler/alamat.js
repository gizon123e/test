const Indonesia = require('../models/IndonesiaProvince')
module.exports = {
    getProvinsi: async(req, res, next) => {
        try {
            const result = await Indonesia.getAllProvince()
            res.json({message: "Berhasil Mendapatkan Semua Provinsi",data: result})
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    getDetailProvinsi: async (req, res, next) =>{
        try {
            const id_prov  = req.params.id
            const result = await Indonesia.getProvince(parseInt(id_prov))
            if(!result || result.length === 0) return res.status(404).json({message: `Tidak ada provinsi dengan id ${id_prov}`})
            res.json({message: "Berhasil Mendapatkan Semua Provinsi",data: result})
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    getRegency: async(req, res, next) => {
        try {
            const id_regency  = req.params.id
            const result = await Indonesia.getRegency(parseInt(id_regency));
            if(!result || result.length === 0) return res.status(404).json({message: `Tidak ada kabupaten/kota dengan id ${id_regency}`})
            res.json({message: "Berhasil Mendapatkan Regency", data: result})
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    getDistrict: async(req, res, next) =>{
        try {
            const id_district  = req.params.id
            const result = await Indonesia.getDistrict(parseInt(id_district));
            if(!result || result.length === 0) return res.status(404).json({message: `Tidak ada kecamatan dengan id ${id_district}`})
            res.json({message: "Berhasil Mendapatkan Kecamatan", data: result})
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    getVillage: async(req, res, next) => {
        try {
            const id_village  = req.params.id
            const result = await Indonesia.getVillage(parseInt(id_village));
            if(!result || result.length === 0) return res.status(404).json({message: `Tidak ada kelurahan dengan id ${id_village}`})
            res.json({message: "Berhasil Mendapatkan Desa / Kelurahan", data: result})
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}
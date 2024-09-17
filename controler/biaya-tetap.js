const BiayaTetap = require("../models/model-biaya-tetap");

module.exports = {
    getBiayaTetap: async(req, res, next) => {
        try {
            const biayaTetap = await BiayaTetap.find()
            return res.status(200).json({
                message: "Data Biaya Tetap",
                data: biayaTetap
            });
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    editBiayaTetap: async(req, res, next) =>{
        try {
            const allowedProperties = [ "biaya_proteksi", "biaya_asuransi", "biaya_layanan", "biaya_jasa_aplikasi", "nilai_koin"];
            const data = req.body
            if(Object.keys(req.body).length === 0) return res.status(400).json({message: "Request Body Kosong atau tidak ada data yang dikirim"});

            Object.keys(req.body).forEach(item => {
                if(!allowedProperties.includes(item)) return res.status(400).json({message: "Properties yang dikirimkan di request body tidak sesuai dengan database: " + item})
            })
            const editBiayaTetap = await BiayaTetap.findByIdAndUpdate(req.body.id, data, {new: true});

            return res.status(200).json({message: "Berhasil mengedit biaya tetap", data: editBiayaTetap})
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}
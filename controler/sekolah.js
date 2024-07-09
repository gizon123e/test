const SimulasiSekolah = require("../models/model-simulasi-sekolah");

module.exports = {
    checkNpsn: async(req, res, next) => {
        try {
            const { NPSN } = req.params
            const data = await SimulasiSekolah.findOne({NPSN});
            if(!data) return res.status(404).json({message: `Tidak ditemukan sekolah dengan NPSN: ${NPSN}`});
            return res.status(200).json({messsage: "Data Sekolah Ditemukan", data})
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}
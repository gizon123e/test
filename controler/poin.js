const PoinHistory = require("../models/model-poin");

module.exports = {
    getPoinHistory: async(req, res, next) => {
        try {
            const { jenis, page = 1, limit = 5 } = req.query; 
            const skip = (page - 1) * limit;
            const poins = await PoinHistory.find({userId: req.user.id}).lean();
            const total_poin = poins.length > 0 ? poins.filter(pn => pn.jenis === "masuk").reduce((acc, val)=> acc + val.value, 0) - poins.filter(pn => pn.jenis === "keluar").reduce((acc, val)=> acc + val.value, 0) 
            : 0 
            let data = poins.filter(pn => { 
                if(!jenis) return true
                return pn.jenis.toLowerCase() === jenis.toLowerCase()
            })
            .slice(skip, skip + limit)
            return res.status(200).json({message: "Berhasil mendapatkan history poin", total_poin, data })
        } catch (error) {
            console.log(error);
            next(error);
        }
    }
}
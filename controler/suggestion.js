const Suggestion = require("../models/model-suggestion");
const TokoVendor = require("../models/vendor/model-toko");

module.exports = {
    getSuggestion: async(req, res, next) => {
        try {
            const { name } = req.query
            const datas = await Suggestion.find({
                nama: { $regex: new RegExp(name, "i") }
            }).limit(10);

            const toko = await TokoVendor.find({
                namaToko: { $regex: new RegExp(name, "i") }
            }).select("namaToko profile_pict userId").limit(10);

            return res.status(200).json({ datas, toko })
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}
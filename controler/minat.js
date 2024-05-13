const Minat = require("../models/model-minat-user");
module.exports = {
    addMinat: async (req, res, next) => {
        try {
            const { categoryId } = req.body
            const minat = await Minat.findOne({userId: req.user.id});
            minat.categoryId.push(categoryId);
            await minat.save()

            return res.status(200).json({message: "Berhasil Menambahkan Minat User", data: minat})
        } catch (error) {
            console.log(error);
            next(error);
        }
    }
}
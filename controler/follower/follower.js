const Follower = require("../../models/model-follower");
const User = require("../../models/model-auth-user")
module.exports = {
    followSeller: async(req, res, next) => {
        try {
            const { sellerUserId } = req.body
            if(!sellerUserId) return res.status(400).json({message: "Kirimkan body sellerUserId"});
            const followed = await Follower.exists({sellerUserId, userId: req.user.id});
            if(followed) return res.status(403).json({message: "Sudah mengikuti toko ini"})
            const user = await User.exists({_id: sellerUserId});
            if(!user) return res.status(400).json({message: "User tidak ditemukan"});
            const follow = await Follower.create({
                userId: req.user.id,
                sellerUserId
            });
            return res.status(200).json({message: "Berhasil mengikuti seller", data: follow})
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}
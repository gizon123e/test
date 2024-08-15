const Follower = require("../../models/model-follower");
const User = require("../../models/model-auth-user")
module.exports = {
    followSeller: async(req, res, next) => {
        try {
            const { sellerUserId } = req.body
            if(!sellerUserId) return res.status(400).json({message: "Kirimkan body sellerUserId"});
            const followed = await Follower.exists({sellerUserId, userId: req.user.id});
            if(followed) {
                Follower.findOneAndDelete({sellerUserId, userId: req.user.id})
                .then(()=> console.log("Berhasil Menyimpan Follower"))
                return res.status(200).json({message: "Berhasil Unfollow", follow: false});
            }
            const user = await User.exists({_id: sellerUserId});
            if(!user) return res.status(400).json({message: "User tidak ditemukan"});
            Follower.create({
                userId: req.user.id,
                sellerUserId
            })
            .then(()=> console.log("Berhasil Menyimpan Follower"))
            res.status(200).json({message: "Berhasil mengikuti seller", follow: true})
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}
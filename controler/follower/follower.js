const Follower = require("../../models/model-follower");
const User = require("../../models/model-auth-user")
module.exports = {
    followSeller: async(req, res, next) => {
        try {
            const { sellerUserId } = req.body
            if(!sellerUserId) return res.status(400).json({message: "Kirimkan body sellerUserId"});
            const user = await User.findById(sellerUserId).select("role");
            if(!user) return res.status(400).json({message: "User tidak ditemukan"});
            let accepted
            switch(req.user.role){
                case "konsumen":
                    accepted = "vendor";
                    break;
                case "vendor":
                    accepted = "supplier";
                    break;
                case "supplier":
                    accepted = 'produsen';
                    break;
            }
            if(accepted !== user.role) return res.status(403).json({message: "Permintaan tidak valid"});
            const followed = await Follower.exists({sellerUserId, userId: req.user.id});
            if(followed) {
                Follower.findOneAndDelete({sellerUserId, userId: req.user.id})
                .then(()=> console.log("Berhasil Menyimpan Follower"))
                return res.status(200).json({message: "Berhasil Unfollow", follow: false});
            }
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
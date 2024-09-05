const DeviceId = require("../../models/model-token-device");

module.exports = {
    getAktivitasLogin: async(req, res, next) => {
        try {
            const devices = (await DeviceId.find({userId: req.user.id}).lean()).map(dv => {
                const { device, deviceId, login_at } = dv
                return {
                    device,
                    deviceId,
                    login_at
                }
            });
            return res.status(200).json({message: "berhasil menampilkan aktifitas login", devices})
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}
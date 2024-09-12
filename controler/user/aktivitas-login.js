const DeviceId = require("../../models/model-token-device");
const geoip = require('geoip-lite');

const typeDeviceChecker = (val) => {
    const desktop = ["windows", "win", "mac", "linux"];
    if (desktop.some((os) => val.toLowerCase().includes(os))) {
        return "desktop";
    } else {
        return "mobile";
    }
};

module.exports = {
    getAktivitasLogin: async(req, res, next) => {
        try {
            const devices = (await DeviceId.find({userId: req.user.id}).lean()).map(dv => {
                const { device, deviceId, login_at, ip } = dv
                return {
                    device,
                    deviceId,
                    login_at,
                    lokasi: `${geoip.lookup(ip).city}, ${geoip.lookup(ip).country}`,
                    deviceType: typeDeviceChecker(device)
                }
            });
            return res.status(200).json({message: "berhasil menampilkan aktifitas login", devices})
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    
    deleteDeviceLogin: async(req, res, next) => {
        try {
            if(!req.body.id) return res.status(400).json({message: "Tolong kirimkan id device login"});
            const device = await DeviceId.findOneAndDelete({deviceId: req.body.id, userId: req.user.id});
            if(!device) return res.status(404).json({message: "Device tidak ditemukan"})
            return res.status(200).json({message: "berhasil menghapus device login"});
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}
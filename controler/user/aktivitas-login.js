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
    }
}
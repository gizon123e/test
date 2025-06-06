const jwt = require('../utils/jwt');
const { getToken } = require('../utils/getToken');
const User = require("../models/model-auth-user");
const User_System = require('../models/model-user-system');
const DeviceId = require('../models/model-token-device');


module.exports = async (req, res, next) => {
    try {
        const token = getToken(req);
        if (!token) return res.status(401).json({ error: false, message: 'Token not Found' });

        const verifyToken = jwt.verifyToken(token);
        req.user = verifyToken;
        const user = await User.findById(req.user.id);
        const user_system = await User_System.findById(req.user.id)
        if(!user && !user_system) return res.status(401).json({message: "Tidak Ada User dengan id " + verifyToken.id + " pastikan token benar"});
        const deviceId = req.headers["x-header-deviceid"];
        if(!deviceId && req.user.role !== 'administrator') return res.status(401).json({ error: true, message: 'Kirimkan device id di headers' });
        const existedDeviceId = await DeviceId.findOne({userId: req.user.id, deviceId});
        if(!existedDeviceId) return res.status(401).json({ error: true, message: 'Invalid Token' });
        next();
    } catch (error) {
        if (error.message === "Token has expired") {
            return res.status(401).json({ error: true, message: 'Token has expired' });
        } else if (error.message === "Invalid Token") {
            return res.status(401).json({ error: true, message: 'Invalid Token' });
        } else {
            console.log(error);
            return res.status(500).json({ error: true, message: 'Token verification failed' });
        }
    }
}
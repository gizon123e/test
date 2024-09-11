const mongoose = require('mongoose');

const model = new mongoose.Schema({
    deviceId: {
        type: String
    },
    userId: {
        type: String
    },
    valid_until: {
        type: Date
    },
    device: {
        type: String
    },
    login_at: {
        type: Date
    },
    ip: {
        type: String
    }
}, { timestamps: true });

const DeviceId = mongoose.model("DeviceId", model);

module.exports = DeviceId;
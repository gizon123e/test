const geolib = require('geolib')

function cekLokasiLatLog(lat1, log2) {
    if (!geolib.isValidCoordinate({ lat1, log2 })) {
        return {
            message: "lat long tidak valid",
            valid: false
        }
    }

    return {
        valid: true
    }
}

module.exports = cekLokasiLatLog
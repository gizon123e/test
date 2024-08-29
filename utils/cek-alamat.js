const geolib = require('geolib')

function cekLokasiLatLog(lat1, log2) {
    if (!geolib.isValidCoordinate({ lat1, log2 })) {
        return {
            message:  `Tidak Valid ${lat1} ${log2}`,
            valid: false
        }
    }

    return {
        valid: true,
        message: `Valid ${lat1} ${log2}`
    }
}

module.exports = cekLokasiLatLog
const axios = require('axios')
require('dotenv').config()

async function calculateDistance(lat1, lon1, lat2, lon2, maxDistance) {
    try {
        const response = await axios.get(`${process.env.URL_SEND_MAPS}/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`);
        const jarak = parseInt(response.data.routes[0].distance) / 1000;
        console.log(jarak)
        if (jarak > maxDistance) {
            return NaN;
        }
        return jarak;
    } catch (error) {
        return NaN
    }
}


module.exports = { calculateDistance };

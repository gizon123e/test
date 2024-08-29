const axios = require('axios')
require('dotenv').config()

async function calculateDistance(lat1, lon1, lat2, lon2, maxDistance) {
    try {
        const response = await axios.get(`https://peta-backend.superdigitalapps.my.id/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`);

        // const response = await axios.get(`https://peta-backend.superdigitalapps.my.id/route/v1/driving/106.63464785719901,-6.276579715529846;106.64978671619583,-6.289461823639146?overview=false`);

        const jarak = parseInt(response.data.routes[0].distance) / 1000;

        if (jarak > maxDistance) {
            return NaN;
        }

        return jarak;
    } catch (error) {
        console.error('Error fetching distance:', error);
        return NaN;
    }
}


module.exports = { calculateDistance };

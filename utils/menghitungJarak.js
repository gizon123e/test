const axios = require('axios')
require('dotenv').config()

async function calculateDistance(lat1, lon1, lat2, lon2, maxDistance) {
    try {
        const response = await axios.get(`${process.env.URL_SEND_MAPS}/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`);
        const jarak = parseInt(response.data.routes[0].distance) / 1000;
        if (jarak > maxDistance) {
            return NaN;
        }
        return 5;
    } catch (error) {
        return NaN
    }
}

// async function calculateDistance (lat1, lon1, lat2, lon2, maxDistance)  {
//     const R = 6371; // Radius bumi dalam kilometer
//     const toRadians = (degree) => degree * (Math.PI / 180);

//     const dLat = toRadians(lat2 - lat1);
//     const dLon = toRadians(lon2 - lon1);

//     const a =
//         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//         Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
//         Math.sin(dLon / 2) * Math.sin(dLon / 2);

//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//     const distance = R * c; // Hasil dalam kilometer
//     if (distance > maxDistance) {
//         return NaN;
//     }
//     return distance;
// }

module.exports = { calculateDistance };

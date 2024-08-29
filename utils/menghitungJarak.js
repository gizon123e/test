const axios = require('axios')
require('dotenv').config()

async function calculateDistance (lat1, lon1, lat2, lon2, maxDistance) {
    try {
        const response = await axios.get(`${process.env.URL_SEND_MAPS}/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`);
        if(!response.status){
            throw Error("Pin Alamat Tidak Benar, pastikan pin alamat tidak terbalik")
        }
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

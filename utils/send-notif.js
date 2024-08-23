const cron = require('node-cron');
const sendNotifikasi = require('../controler/notifikasi').sendNotifikasi

module.exports = async() => {
     try{
          cron.schedule('* * * * * *', () => {
               console.log('Running schedule taks: sendNotifikasi');
               sendNotifikasi()
          })
          
     } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}
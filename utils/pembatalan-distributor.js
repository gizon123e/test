const cron = require('node-cron')
const { updateOrderStatuses, updatePelanggaranDistributor } = require('../controler/distributtor/pesananDistributor')

module.exports = {
    batalPesanan: async () => {
        try {
            cron.schedule('*/2 * * * *', () => {
                console.log('Running Distributor status update job...');
                // updateOrderStatuses();
            })

            cron.schedule('*/2 * * * *', () => {
                console.log('Running Distributor violation reset job...');
                // updatePelanggaranDistributor();
            })
        } catch (error) {
            console.log("error", error)
        }
    }
}
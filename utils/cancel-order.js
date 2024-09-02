const cron = require('node-cron')
const FlashSale = require('../models/model-flashsale');
const Product = require('../models/model-product');
const orderVendorAutoCancel = require('../controler/orders').automaticVendorOrderCancel
async function flash_sale_checker(){
    try {
        const flashSale = await FlashSale.find({
            endTime: { $lte: new Date() }
        });
    
        if (flashSale && flashSale.length > 0) {
            const categoryIds = [];
            for (let flsh of flashSale) {
                flsh.categoryId.forEach(catId => categoryIds.push(catId.value));
            }
    
            await Product.updateMany(
                { categoryId: { $in: categoryIds } },
                { $set: { isFlashSale: false } }
            );
    
        } else {
        }
    } catch (error) {
        console.log(error)
    }
}

module.exports = async () => {
    try {    
        // Jadwalkan cron job untuk menjalankan setiap menit
        cron.schedule('* * * * *', () => {
          console.log('Running scheduled task: cancelExpiredOrders');
        //   orderVendorAutoCancel()
          flash_sale_checker();
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}
const cron = require('node-cron')
const Pesanan = require('../models/pesanan/model-orders');
const FlashSale = require('../models/model-flashsale');
const Product = require('../models/model-product');

async function cancelExpiredOrders() {
    try {
      const now = new Date();
  
      const result = await Pesanan.updateMany(
        { expire: { $lt: now }, status: "Belum Bayar" },
        { status: "Dibatalkan", canceledBy: "sistem", reason: "order expired" }
      );
  
      console.log(`Orders updated: ${JSON.stringify(result)}`);
    } catch (error) {
      console.error('Error updating orders:', error);
    }
};

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
    
            console.log('Produk berhasil diperbarui.');
        } else {
            console.log('Tidak ada flashSale yang ditemukan.');
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
          cancelExpiredOrders();
          flash_sale_checker();
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}
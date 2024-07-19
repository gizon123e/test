// const cron = require('node-cron');
// const Product = require('../models/model-product');
// const FlashSale = require('../models/model-flashsale');

// const cronJob = cron.schedule('0 * * * *', async function() {
//     console.log('setiap 1 jam dijalankan');
    
//     const flashSale = await FlashSale.find({
//         endTime: { $lte: new Date() }
//     });

//     if (flashSale && flashSale.length > 0) {
//         const categoryIds = [];
//         for (let flsh of flashSale) {
//             flsh.categoryId.forEach(catId => categoryIds.push(catId.value));
//         }

//         await Product.updateMany(
//             { categoryId: { $in: categoryIds } },
//             { $set: { isFlashSale: false } }
//         );

//         console.log('Produk berhasil diperbarui.');
//     } else {
//         console.log('Tidak ada flashSale yang ditemukan.');
//     }
// });

// module.exports = cronJob;

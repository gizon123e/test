const BiayaTetap = require("../models/model-biaya-tetap");
const PoinHistory = require("../models/model-poin");
const task = async()=>{
    await PoinHistory.deleteMany({})
}

async function createDynamicCron() {
    const dateString = await BiayaTetap.findOne({})

    const [day, month] = dateString?.expired_point?.split('-');
  
    // Format cron untuk menjalankan setiap tahun pada tanggal tertentu
    const cronExpression = `0 0 0 ${day} ${month} *`;
  
    // Membuat cron job
    cron.schedule(cronExpression, task, {
      scheduled: true,
      timezone: "Asia/Jakarta"
    });
  
    console.log(`Cron job scheduled for ${dateString}`);
}

module.exports = createDynamicCron
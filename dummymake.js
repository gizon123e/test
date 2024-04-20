require('./database/database')
const Report = require("./models/model-laporan-penjualan");
const productId = "661f6ab005432c70eed53377"
const laporan =  Report.findOne({productId}).then(async(laporan)=>{
    for (let i = 1; i <= 30; i++){
        const now = new Date()
        now.setDate(now.getDate() - i)
        laporan.track.push({time: now, soldAtMoment: Math.floor(Math.random() * 100) + 1})
        await laporan.save()
    }
})

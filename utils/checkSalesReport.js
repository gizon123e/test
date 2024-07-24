const SalesReport = require("../models/model-laporan-penjualan");

async function salesReport(productId, dataSales){
    const found = await SalesReport.findById(productId);
    if(!found){
        return SalesReport.create({
            productId,
            track: [
                dataSales
            ]
        })
    }

    return SalesReport.findByIdAndUpdate(
        productId,
        {
            $push: {
                track: dataSales
            }
        }
    )
}

module.exports = salesReport
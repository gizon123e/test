const Excel = require("exceljs");
const workbook = new Excel.Workbook();
const SimulasiSekolah = require("../models/model-simulasi-sekolah");
require('../database/database')
async function blah(){
    const vendor = await workbook.csv.readFile("./vendor.csv");
    const finalData = []
    vendor.eachRow({ includeEmpty: false }, (row, number) => {
        if(number > 1){
            const namaPenjual = row.getCell(2).value;
            const alamat = row.getCell(3).value.split(',');
            console.log(namaPenjual)
            if(number > 1)console.log(alamat)
        }
    })
    // await SimulasiSekolah.insertMany(finalData)
}

blah()
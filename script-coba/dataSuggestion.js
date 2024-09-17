require('../database/database')
const Suggestion = require('../models/model-suggestion');
const Excel = require('exceljs');

async function nyot(){
    const workbook = new Excel.Workbook();

    const dataset = await workbook.csv.readFile("./indonesian_food.csv");
    const nama = dataset.getColumn(2);
    const data = []
    nama.eachCell((cell, rowNumber)=> {
        if(rowNumber > 1) data.push({nama: cell.value})
    })
    await Suggestion.insertMany(data)
}

nyot()
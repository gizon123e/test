const Excel = require('exceljs')


module.exports = {
    penjualan: async (data, nama, exprt) =>{
        const workbook = new Excel.Workbook()
        const worksheet = workbook.addWorksheet('Laporan ' + nama)
        
        worksheet.columns = [
            {header: "Nama Product", key: "nama", width: 20},
            {header: "Tanggal", key: "tanggal", width: 20},
            {header: "Jumlah Terjual", key: "terjual", width: 20},
            {header: "Total Terjual", key: "total", width: 20}
        ]
        
        data.dataPenjualan.forEach((d,i)=>{
            worksheet.addRow({ nama: data.namaProduct, tanggal: d.tanggal, terjual: d.terjual });
        })
        
        worksheet.addRow({total: data.totalTerjual})
        if(exprt === true){
            const buffer = await workbook.xlsx.writeBuffer()
            return buffer
        }
    }
}
const Excel = require('exceljs')

module.exports = {
    penjualan: async (req, res, next) =>{
        const { data } = req.body;
        if(!data) return res.status(400).json({message:"Kirimkan data yang diterima dari laporan penjualan"});
        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet('Laporan Penjualan');
        
        worksheet.columns = [
            {header: "Nama Product", key: "nama", width: 20},
            {header: "Tanggal", key: "tanggal", width: 20},
            {header: "Jumlah Terjual", key: "terjual", width: 20},
            {header: "Total Terjual", key: "total", width: 20}
        ];

        let isNamaProductAdded = false;
        data.dataPenjualan.forEach((d, i) => {
            if (i === 0 && !isNamaProductAdded) {
                worksheet.addRow({ nama: data.namaProduct, tanggal: d.tanggal, terjual: d.terjual });
                isNamaProductAdded = true;
            } else {
                worksheet.addRow({ tanggal: d.tanggal, terjual: d.terjual });
            }
        });

        worksheet.addRow({total: data.totalTerjual});
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="data.xlsx"');
        const buffer = await workbook.xlsx.writeBuffer();
        res.send(buffer)
    },

    performance: async (req, res, next) => {
        const { data } = req.body;
        if(!data) return res.status(400).json({message:"Kirimkan data yang diterima dari laporan penjualan"});
        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet('Laporan Penjualan');
        
        const combinedData = [];
        data.dataImpresi.forEach(impresi => {
            const matchingView = data.dataViews.find(view => view.tanggal === impresi.tanggal);
            combinedData.push({
                nama: data.namaProduct,
                tanggal: impresi.tanggal,
                jumlahImpresi: impresi.jumlah,
                jumlahViews: matchingView ? matchingView.jumlah : 0
            });
        });

        worksheet.columns = [
            { header: 'Nama Product', key: 'nama', width: 20 },
            { header: 'Tanggal', key: 'tanggal', width: 20 },
            { header: 'Jumlah Impresi', key: 'jumlahImpresi', width: 20 },
            { header: 'Jumlah Views', key: 'jumlahViews', width: 20 }
        ];

        combinedData.forEach(row => {
            worksheet.addRow(row);
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="data.xlsx"');
        const buffer = await workbook.xlsx.writeBuffer();
        res.send(buffer)
    },

    trend: async(req, res, next)=>{
        try {
            const { data } = req.body;
            if(!data) return res.status(400).json({message:"Kirimkan data yang diterima dari laporan trend"});
            const workbook = new Excel.Workbook();

            data.forEach((produk)=>{
                const worksheet = workbook.addWorksheet('Laporan Trend ' + produk.namaProduct);

                worksheet.columns  = [
                    {header: "Tanggal", key:'tanggal', width: 20},
                    {header: "Jumlah Views", key:'view', width: 20},
                    {header: "Jumlah Impresi", key:'impresi', width: 20},
                    {header: "Jumlah Terjual", key:'terjual', width: 20},
                ];

                const maxLength = Math.max(produk.dataPenjualan.length, produk.dataViews.length, produk.dataImpression.length)

                const arraysWithMaxLength = [produk.dataPenjualan, produk.dataViews, produk.dataImpression].find(array => array.length === maxLength);

                arraysWithMaxLength.forEach((data, index)=>{
                    worksheet.addRow({tanggal: data.tanggal});
                });

                worksheet.getColumn("tanggal").eachCell((cell, rowNumber)=>{
                    const jual = produk.dataPenjualan.find((data)=>data.tanggal === cell.value)
                    const impression = produk.dataImpression.find((data)=>data.tanggal === cell.value)
                    const view = produk.dataViews.find((data)=>data.tanggal === cell.value)
                    if (jual) {
                        worksheet.getCell(`D${rowNumber}`).value = jual.jumlah;
                    }

                    if (impression) {
                        worksheet.getCell(`C${rowNumber}`).value = impression.jumlah;
                    }

                    if (view) {
                        worksheet.getCell(`B${rowNumber}`).value = view.jumlah;
                    }
                })
            })

            await workbook.xlsx.writeFile('laporan.xlsx'); 
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="data.xlsx"');
            const buffer = await workbook.xlsx.writeBuffer();
            res.send(buffer)
            
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
}
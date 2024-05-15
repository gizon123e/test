const csv_parser = require("csv-parse").parse;
const fs = require('fs');
const path = require('path');
const provinsiPath = path.join('./', 'utils', 'data-alamat', 'provinsi.csv');
const kabkotPath = path.join('./', 'utils', 'data-alamat', 'kabkot.csv');
const jenis_kabkotPath = path.join('./', 'utils', 'data-alamat', 'jenis_kabkot.csv');
const kecamatanPath = path.join('./', 'utils', 'data-alamat', 'kecamatan.csv');
const deskelPath = path.join('./', 'utils', 'data-alamat', 'deskel.csv');


module.exports = {
    getProvinsi: async (req, res, next) => {
        try {
            fs.readFile(provinsiPath, 'utf8', (err, data) => {
                if (err) {
                    console.error(err);
                    next(err);
                }
                
                // Memisahkan baris-baris CSV
                const lines = data.trim().split('\n');
                
                // Mendapatkan header
                const headers = lines.shift().split(',');
            
                // Menguraikan setiap baris ke dalam objek
                const provinsi = lines.map(line => {
                    const values = line.split(',');
                    const obj = {};
                    headers.forEach((header, index) => {
                        obj[header.trim()] = values[index].trim();
                    });
                    return obj;
                });
            
                fs.readFile(kabkotPath, 'utf-8', (err, data) => {
                    if(err){
                        console.log(err);
                        next(err)
                    }

                    const lines = data.trim().split('\n');

                    const headers = lines.shift().split(',');

                    const kabkot = lines.map(line => {
                        const values = line.split(',');
                        const obj = {}
                        headers.forEach((header, index)=>{
                            obj[header.trim()] = values[index].trim();
                        });
                        return obj
                    })
                })
            });
            // const data = await new Promise((resolve, reject) => {
            //     const results = [];
            //     fs.createReadStream(provinsiPath)
            //     .pipe(csv_parser({ delimiter:",", from_line: 1}))
            //     .on("data", async function(row){
            //         const provinsi = row;
            //         const kota = await new Promise((resolve, reject))
            //     })
            //     .on("error", function(err){
            //         console.log(err);
            //         reject(err);
            //     })
            //     .on('end', function(){
            //         console.log("beres");
            //         resolve(results);
            //     });
            // });
    
            // console.log(data);
            // res.status(200).json(data);
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    }
}
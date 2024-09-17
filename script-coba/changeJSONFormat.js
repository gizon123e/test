async function blah() {
    const data = JSON.parse(fs.readFileSync('./address.json', 'utf8'));

    const finalData = Object.keys(data).map(key => {
        return {
            id: data[key].ID,
            name: key,
            regencies: Object.keys(data[key]['Kabupaten/Kota']).map(key2 => {
                return {
                    id: data[key]['Kabupaten/Kota'][key2].ID.replace(/\./g, ''),
                    name: key2.split(', ').reverse().join(' '),
                    districts: Object.keys(data[key]['Kabupaten/Kota'][key2]['Kecamatan']).map(key3 => {
                        return {
                            id: data[key]['Kabupaten/Kota'][key2]['Kecamatan'][key3].ID.replace(/\./g, ''),
                            name: key3,
                            villages: Object.keys(data[key]['Kabupaten/Kota'][key2]['Kecamatan'][key3]['Kelurahan/Desa']).map(key4 => {
                                return {
                                    id: data[key]['Kabupaten/Kota'][key2]['Kecamatan'][key3]['Kelurahan/Desa'][key4].ID.replace(/\./g, ''),
                                    name: key4,
                                    kode_pos: data[key]['Kabupaten/Kota'][key2]['Kecamatan'][key3]['Kelurahan/Desa'][key4]['Kode Pos']
                                }
                            })
                        }
                    })
                }
            })
        }
    });
    
    const jsonData = JSON.stringify(finalData, null, 2); // The second argument (null) is for replacer, and the third argument (2) is for indentation
    fs.writeFileSync('./finalData.json', jsonData, 'utf8');
    console.log('Data has been written to finalData.json');
}
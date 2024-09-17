const InformasiBantuanKonsumen = require('../../models/informasi-bantuan/informasi-bantuan-konsumen')

module.exports = {
    getInformasiBantuanKonsumen: async (req, res, next) => {
        try {
            const { id_judul_utama, id_sub_judul } = req.query

            let query = {}

            if (id_judul_utama) {
                query.id_judul_utama = id_judul_utama
            }

            if (id_sub_judul) {
                query.id_sub_informasi_bantuan = id_sub_judul
            }

            const datas = await InformasiBantuanKonsumen.find(query)

            res.status(200).json({
                message: "get data success",
                datas
            })
        } catch (error) {
            console.log(error)
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                })
            }
            next(error)
        }
    },

    createInformasiBantuanKonsumen: async (req, res, next) => {
        try {
            const {
                soal,
                jawaban, // Expecting an array of objects
                id_sub_informasi_bantuan,
                id_judul_utama
            } = req.body;
            const files = req.files;
            const file_informasi_bantuan = files ? files.file_informasi_bantuan : null;

            // Creating new InformasiBantuanKonsumen document
            const newInformasiBantuanKonsumen = new InformasiBantuanKonsumen({
                soal,
                jawaban,
                id_sub_informasi_bantuan,
                id_judul_utama,
                file_informasi_bantuan // Assigning file path if it exists
            });

            // Saving to database
            const savedInformasi = await newInformasiBantuanKonsumen.save();

            res.status(201).json({
                message: "create data success",
                data: savedInformasi
            });
        } catch (error) {
            // Tangani error jika ada
            console.log(error)
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.fields
                })
            }
            next(error)
        }
    }
}
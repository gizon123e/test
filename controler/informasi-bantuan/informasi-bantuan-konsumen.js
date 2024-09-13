const InformasiBantuanKonsumen = require('../../models/informasi-bantuan/informasi-bantuan-konsumen')

module.exports = {
    getInformasiBantuanKonsumen: async (req, res, next) => {
        try {
            const datas = await InformasiBantuanKonsumen.find()

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
            // Data yang akan di-insert ke dalam database
            const newInformasiBantuan = new InformasiBantuanKonsumen({
                informasi_akun: {
                    judul: req.body.informasi_akun.judul,
                    pertanyaan_satu: {
                        description_satu: req.body.informasi_akun.pertanyaan_satu.description_satu,
                        soal: req.body.informasi_akun.pertanyaan_satu.soal,
                        list_jawaban: req.body.informasi_akun.pertanyaan_satu.list_jawaban,
                        description_dua: req.body.informasi_akun.pertanyaan_satu.description_dua,
                    },
                    pertanyaan_dua: {
                        description: req.body.informasi_akun.pertanyaan_dua.description,
                        soal: req.body.informasi_akun.pertanyaan_dua.soal,
                        list_jawaban: req.body.informasi_akun.pertanyaan_dua.list_jawaban,
                        sub_list_jawaban: req.body.informasi_akun.pertanyaan_dua.sub_list_jawaban,
                    },
                    // Tambahkan pertanyaan lainnya sesuai kebutuhan...
                },
                register: {
                    judul: req.body.register.judul,
                    pertanyaan: req.body.register.pertanyaan,
                },
                pengiriman: {
                    judul: req.body.pengiriman.judul,
                    pertanyaan: req.body.pengiriman.pertanyaan,
                },
                informasi_ongkos_kirim: {
                    judul: req.body.informasi_ongkos_kirim.judul,
                    data_jawaban: req.body.informasi_ongkos_kirim.data_jawaban,
                },
                keamanan_akun: {
                    judul: req.body.keamanan_akun.judul,
                    pertanyaan_satu: req.body.keamanan_akun.pertanyaan_satu,
                    pertanyaan_dua: req.body.keamanan_akun.pertanyaan_dua,
                },
                pin_mbg: {
                    judul: req.body.pin_mbg.judul,
                    pertanyaan_satu: req.body.pin_mbg.pertanyaan_satu,
                },
                transaksi: {
                    judul: req.body.transaksi.judul,
                    pertanyaan: req.body.transaksi.pertanyaan,
                },
                tranfer: {
                    judul: req.body.tranfer.judul,
                    pertanyaan: req.body.tranfer.pertanyaan,
                },
                saldo_dan_tagihan: {
                    judul: req.body.saldo_dan_tagihan.judul,
                    pertanyaan: req.body.saldo_dan_tagihan.pertanyaan,
                    jawaban: req.body.saldo_dan_tagihan.jawaban,
                },
                tagihan: {
                    judul: req.body.tagihan.judul,
                    pertanyaan_satu: req.body.tagihan.pertanyaan_satu,
                    pertanyaan_dua: req.body.tagihan.pertanyaan_dua,
                },
                pesanan: {
                    judul: req.body.pesanan.judul,
                    pertanyaan: req.body.pesanan.pertanyaan,
                },
                membuat_pesanan: {
                    judul: req.body.membuat_pesanan.judul,
                    pertanyaan: req.body.membuat_pesanan.pertanyaan,
                },
                promo: {
                    judul: req.body.promo.judul,
                    pertanyaan: req.body.promo.pertanyaan,
                    jawaban: req.body.promo.jawaban,
                },
                poin: {
                    judul: req.body.poin.judul,
                    jawaban: req.body.poin.jawaban,
                },
            });

            // Simpan data ke dalam database
            const savedInformasi = await newInformasiBantuan.save();

            // Kirim respons sukses
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
const InformasiBantuanVendor = require('../../models/informasi-bantuan/informasi-bantuan-vendor')

module.exports = {
    // Controller untuk membuat data InformasiBantuanVendor
    createInformasiBantuanVendor: async (req, res, next) => {
        try {
            // Membuat instance baru dari model dengan data yang diterima dari request body
            const newInformasiBantuanVendor = new InformasiBantuanVendor({
                sebagai_pembeli: {
                    judul_utama: req.body.sebagai_pembeli.judul_utama,
                    judul_sub: req.body.sebagai_pembeli.judul_sub,
                    pertanyaan: req.body.sebagai_pembeli.pertanyaan
                },
                sebagai_penjual: {
                    judul_utama: req.body.sebagai_penjual.judul_utama,
                    judul_sub: req.body.sebagai_penjual.judul_sub,
                    pertanyaan: req.body.sebagai_penjual.pertanyaan
                },
                akun_dan_aplikasi: {
                    judul_utama: req.body.akun_dan_aplikasi.judul_utama,
                    judul_sub: req.body.akun_dan_aplikasi.judul_sub,
                    pertanyaan_satu: req.body.akun_dan_aplikasi.pertanyaan_satu,
                    pertanyaan_dua: req.body.akun_dan_aplikasi.pertanyaan_dua,
                    pertanyaan_tiga: req.body.akun_dan_aplikasi.pertanyaan_tiga
                },
                register: {
                    judul_utama: req.body.register.judul_utama,
                    pertanyaan: req.body.register.pertanyaan
                },
                analisis_toko: {
                    judul_utama: req.body.analisis_toko.judul_utama,
                    pertanyaan: req.body.analisis_toko.pertanyaan
                },
                toko: {
                    judul_utama: req.body.toko.judul_utama,
                    judul_sub: req.body.toko.judul_utama,
                    pertanyaan: req.body.toko.pertanyaan
                },
                kendala_toko: {
                    judul_utama: req.body.kendala_toko.judul_utama,
                    pertanyaan: req.body.kendala_toko.pertanyaan
                },
                reputasi_toko: {
                    judul_utama: req.body.reputasi_toko.judul_utama,
                    pertanyaan: req.body.reputasi_toko.pertanyaan
                },
                produk: {
                    judul_utama: req.body.produk.judul_utama,
                    pertanyaan_satu: req.body.produk.pertanyaan_satu,
                    pertanyaan_dua: req.body.produk.pertanyaan_dua
                },
                kendala_pesanan: {
                    judul_utama: req.body.kendala_pesanan.judul_utama,
                    pertanyaan: req.body.kendala_pesanan.pertanyaan
                },
                rating_dan_ulasan: {
                    judul_utama: req.body.rating_dan_ulasan.judul_utama,
                    pertanyaan_satu: req.body.rating_dan_ulasan.pertanyaan_satu,
                    pertanyaan_dua: req.body.rating_dan_ulasan.pertanyaan_dua
                },
                promosi: {
                    judul_utama: req.body.promosi.judul_utama,
                    pertanyaan: req.body.promosi.pertanyaan
                },
                keuangan: {
                    judul_utama: req.body.keuangan.judul_utama,
                    judul_sub: req.body.keuangan.judul_sub,
                    pertanyaan: req.body.keuangan.pertanyaan
                },
                penghasilan: {
                    judul_utama: req.body.penghasilan.judul_utama,
                    pertanyaan: req.body.penghasilan.pertanyaan
                },
                pengiriman: {
                    judul_utama: req.body.pengiriman.judul_utama,
                    pertanyaan: req.body.pengiriman.pertanyaan
                }
            });

            // Menyimpan data ke database
            const savedInformasi = await newInformasiBantuanVendor.save();

            // Mengirim respons sukses dengan data yang disimpan
            res.status(201).json({
                message: 'create data success',
                data: savedInformasi
            });
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
    }

}
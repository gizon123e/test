const Distributtor = require('../../models/distributor/model-distributor')
const Pengemudi = require('../../models/distributor/model-pengemudi')
const path = require('path')
const ProsesPengirimanDistributor = require('../../models/distributor/model-proses-pengiriman')
require('dotenv').config()

module.exports = {
    getPengemudiList: async (req, res, next) => {
        try {
            const { status } = req.query

            if (req.user.role === 'distributor') {
                const distributor = await Distributtor.findOne({ userId: req.user.id })

                let query = {
                    id_distributor: distributor._id
                };

                if (status) {
                    query.status = status;
                }

                const dataPengemudi = await Pengemudi.find(query).populate("id_distributor")
                if (!dataPengemudi || dataPengemudi.length === 0) return res.status(400).json({ message: "saat ini data kosong" })

                return res.status(200).json({
                    message: "get data success",
                    data: dataPengemudi
                })
            } else if (req.user.role === 'administrator') {
                const dataPengemudi = await Pengemudi.find().populate("id_distributor")
                if (!dataPengemudi || dataPengemudi.length === 0) return res.status(400).json({ message: "saat ini data kosong" })

                return res.status(200).json({
                    message: "get data success",
                    data: dataPengemudi
                })
            }
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    getPengemudiDetail: async (req, res, next) => {
        try {
            const dataPengemudi = await Pengemudi.findOne({ _id: req.params.id }).populate("id_distributor")
            if (!dataPengemudi) return res.status(404).json({ message: "data Not Found" })

            res.status(200).json({
                message: "get data success",
                data: dataPengemudi
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    createPengemudi: async (req, res, next) => {
        try {
            const { id_distributor, nama, jenisKelamin, tanggalLahir, no_telepon, jenis_sim } = req.body
            const files = req.files;
            const file_sim = files ? files.file_sim : null;
            const profile = files ? files.profile : null;
            const fileKTP = files ? files.fileKTP : null;

            if (!fileKTP || !profile || !file_sim) return res.status(400).json({ message: "file KTP / file Profile / file SIM gagal di masukan filenya" })

            const imageNameKTP = `${Date.now()}${path.extname(fileKTP.name)}`;
            const imagePathKTP = path.join(__dirname, '../../public/image-ktp', imageNameKTP);

            await fileKTP.mv(imagePathKTP);

            const imageNameProfile = `${Date.now()}${path.extname(profile.name)}`;
            const imagePathProfile = path.join(__dirname, '../../public/image-profile-distributtor', imageNameProfile);

            await profile.mv(imagePathProfile);

            const imageName = `${Date.now()}${path.extname(file_sim.name)}`;
            const imagePath = path.join(__dirname, '../../public/image-profile-distributtor', imageName);

            await file_sim.mv(imagePath);

            const regexNotelepon = /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/
            if (!regexNotelepon.test(no_telepon.toString())) return res.status(400).json({ message: "Nomor telepon tidak valid" });

            const dataPengemudi = await Pengemudi.create({
                id_distributor,
                nama,
                jenisKelamin,
                tanggalLahir,
                profile: `${process.env.HOST}public/image-profile-distributtor/${imageNameProfile}`,
                file_sim: `${process.env.HOST}public/image-profile-distributtor/${imageName}`,
                no_telepon: no_telepon.toString(),
                fileKTP: `${process.env.HOST}public/image-ktp/${imageNameKTP}`,
                tanggalLahir,
                jenis_sim
            })

            res.status(201).json({
                message: "create pengemudi success",
                data: dataPengemudi
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    updatePengemudiDistributor: async (req, res, next) => {
        try {
            const { no_telepon, jenis_sim } = req.body
            const files = req.files;
            const file_sim = files ? files.file_sim : null;

            const imageName = `${Date.now()}${path.extname(file_sim.name)}`;
            const imagePath = path.join(__dirname, '../../public/image-profile-distributtor', imageName);

            await file_sim.mv(imagePath);

            const regexNotelepon = /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/
            if (!regexNotelepon.test(no_telepon.toString())) return res.status(400).json({ message: "Nomor telepon tidak valid" });

            const dataPengemudi = await Pengemudi.findByIdAndUpdate({ _id: req.params.id }, {
                file_sim: `${process.env.HOST}public/image-profile-distributtor/${imageName}`,
                no_telepon: no_telepon.toString(),
                jenis_sim
            }, { new: true })

            res.status(200).json({
                message: "update success data",
                data: dataPengemudi
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    updateStatusPengemudi: async (req, res, next) => {
        try {
            const { status, descriptionStatusPengemudi } = req.body
            const dataPengemudi = await Pengemudi.findOne({ _id: req.params.id }).populate("id_distributor")
            if (!dataPengemudi) return res.status(404).json({ message: "data Not Found" })

            let data
            if (status === 'Aktif') {
                data = await Pengemudi.findByIdAndUpdate({ _id: req.params.id }, { status: 'Aktif' }, { new: true })
            } else if (status === 'Disuspend') {
                if (!descriptionStatusPengemudi) return res.status(400).json({ message: "descriptionStatusPengemudi harus di isi" })
                data = await Pengemudi.findByIdAndUpdate({ _id: req.params.id }, { descriptionStatusPengemudi, status: 'Disuspend' }, { new: true })
            } else if (status === 'Diberhentikan') {
                if (!descriptionStatusPengemudi) return res.status(400).json({ message: "descriptionStatusPengemudi harus di isi" })
                data = await Pengemudi.findByIdAndUpdate({ _id: req.params.id }, { descriptionStatusPengemudi, status: 'Diberhentikan' }, { new: true })
            } else if (status === 'Ditolak') {
                if (!descriptionStatusPengemudi) return res.status(400).json({ message: "descriptionStatusPengemudi harus di isi" })
                data = await Pengemudi.findByIdAndUpdate({ _id: req.params.id }, { descriptionStatusPengemudi, status: 'Ditolak' }, { new: true })
            } else if (status === 'Diblokir') {
                if (!descriptionStatusPengemudi) return res.status(400).json({ message: "descriptionStatusPengemudi harus di isi" })
                data = await Pengemudi.findByIdAndUpdate({ _id: req.params.id }, { descriptionStatusPengemudi, status: 'Diblokir' }, { new: true })
            }

            res.status(200).json({
                message: "update data success",
                data
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    getAllPengemudiProsesPengiriman: async (req, res, next) => {
        try {
            const distributor = await Distributtor.findOne({ userId: req.user.id })
            if (!distributor) return res.status(404).json({ message: "distributor not found" })

            const penentuanWaktu = await ProsesPengirimanDistributor.findById(req.params.id).populate('pengirimanId')
            if (!penentuanWaktu) return res.status(404).json({ message: "proses pesanan not found" })

            const prosesPengiriman = await ProsesPengirimanDistributor.find({ distributorId: distributor._id }).populate('pengirimanId')
            if (prosesPengiriman.length === 0) return res.status(404).json({ message: "proses pesanan saat ini kosong" })

            const totalWaktu = penentuanWaktu.optimasi_pengiriman * 2

            const today = new Date(penentuanWaktu.waktu_pengiriman);
            const formattedDate = today.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });

            const pengemudi = await Pengemudi.find({ id_distributor: distributor._id })

            const datas = []

            for (let item of pengemudi) {
                let tidakTersedia = false;

                for (let data of prosesPengiriman) {
                    const totalWaktuEstimasi = data.optimasi_pengiriman * 2;

                    const dateParameter = new Date(data.waktu_pengiriman);
                    const dateSaatIni = dateParameter.toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    });

                    if (dateSaatIni === formattedDate && (totalWaktu === totalWaktuEstimasi || totalWaktu >= totalWaktuEstimasi) && item._id.equals(data.id_pengemudi)) {
                        tidakTersedia = true;
                        break; // Jika sudah ditemukan tidak tersedia, tidak perlu memeriksa lebih lanjut
                    }
                }

                datas.push({
                    ...item.toObject(),
                    tidak_tersedia: tidakTersedia
                });
            }

            res.status(200).json({
                message: "get data pengemudi success",
                datas
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    getPengemudiAktif: async (req, res, next) => {
        try {
            const allowedStatuses = ["Sedang dijemput", "Sudah dijemput", "Sedang dikirim"];

            const distributor = await Distributtor.findOne({ userId: req.user.id })
            if (!distributor) return res.status(404).json({ message: "data Distributor Not Found" })

            const dataProsessPengemudi = await ProsesPengirimanDistributor.find({ distributorId: distributor._id, status_distributor: { $in: allowedStatuses }, id_pengemudi: { $ne: null } })
                .populate('buyerId')
                .populate('distributorId')

            res.status(200).json({
                message: "get Pengemudi Sedang Aktif success",
                datas: dataProsessPengemudi
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
}
const CampeniProfileMBG = require('../../models/model-campeniProfile/campeniProfile-MBG')
const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv')
dotenv.config()

module.exports = {
    getAllCampeniProfileMBG: async (req, res, next) => {
        try {
            const datas = await CampeniProfileMBG.find()
            if (!datas) return res.status(400).json({ message: 'data saat ini masi kosong' })

            res.status(200).json({
                message: "get all data success",
                datas
            })
        } catch (error) {
            console.error(error);
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.errors
                });
            }
            next(error);
        }
    },

    getByIdCampeniProfileMBG: async (req, res, next) => {
        try {
            const data = await CampeniProfileMBG.findOne({ _id: req.params.id })
            if (!data) return res.status(404).json({ message: 'id Not Found' })

            res.status(200).json({
                message: "get all data success",
                data
            })
        } catch (error) {
            console.error(error);
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.errors
                });
            }
            next(error);
        }
    },

    createCampeniProfileMBG: async (req, res, next) => {
        try {
            const {
                navbarMenu,
                herosectionTitel,
                herosectionDescription,
                about,
                visiDanMisi,
                contenBenefitTitel,
                contenBenefitDescription,
                peningkatanStatusGiziTitel,
                peningkatanStatusGiziDescription,
                mendukungPertumbuhanTitel,
                mendukungPertumbuhanDescription,
                meningkatkanPerekonomianTitel,
                meningkatkanPerekonomianDescription,
                produkKamiTitel,
                produkKamiDescription,
                aplikasiTitel,
                aplikasiDescription,
                titelVisiDanMisi
            } = req.body
            const files = req.files
            const video = files ? files.video : null;
            const logo = files ? files.logo : null;

            const menu = navbarMenu.split('/');
            const statusGizi = peningkatanStatusGiziDescription.split('/')
            const pertumbuhan = mendukungPertumbuhanDescription.split('/')
            const perekonomian = meningkatkanPerekonomianDescription.split('/')

            if (!video || !logo) {
                return res.status(400).json({ message: "kamu gagal masukan file logo dan video" });
            }

            const namaLogo = `${Date.now()}${path.extname(logo.name)}`;
            const fileLogo = path.join(__dirname, '../../public/campeni-profile', namaLogo);
            await logo.mv(fileLogo);

            const namaVideo = `${Date.now()}${path.extname(video.name)}`;
            const fileVideo = path.join(__dirname, '../../public/campeni-profile', namaVideo);
            await video.mv(fileVideo);

            const data = await CampeniProfileMBG.create({
                navbarMenu: menu,
                herosectionTitel,
                herosectionDescription,
                about,
                visiDanMisi,
                contenBenefitTitel,
                contenBenefitDescription,
                peningkatanStatusGiziTitel,
                peningkatanStatusGiziDescription: statusGizi,
                mendukungPertumbuhanTitel,
                mendukungPertumbuhanDescription: pertumbuhan,
                meningkatkanPerekonomianTitel,
                meningkatkanPerekonomianDescription: perekonomian,
                produkKamiTitel,
                produkKamiDescription,
                aplikasiTitel,
                aplikasiDescription,
                titelVisiDanMisi,
                logo: `${process.env.HOST}public/campeni-profile/${namaLogo}`,
                video: `${process.env.HOST}public/campeni-profile/${namaVideo}`
            })

            res.status(201).json({
                message: "create data success",
                // data
            })
        } catch (error) {
            console.error(error);
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.errors
                });
            }
            next(error);
        }
    },

    updateCampeniProfileMBG: async (req, res, next) => {
        try {
            const {
                navbarMenu,
                herosectionTitel,
                herosectionDescription,
                about,
                visiDanMisi,
                contenBenefitTitel,
                contenBenefitDescription,
                peningkatanStatusGiziTitel,
                peningkatanStatusGiziDescription,
                mendukungPertumbuhanTitel,
                mendukungPertumbuhanDescription,
                meningkatkanPerekonomianTitel,
                meningkatkanPerekonomianDescription,
                produkKamiTitel,
                produkKamiDescription,
                aplikasiTitel,
                aplikasiDescription,
                titelVisiDanMisi
            } = req.body
            const files = req.files
            const video = files ? files.video : null;
            const logo = files ? files.logo : null;

            const menu = navbarMenu.split('/');

            if (!video || !logo) {
                return res.status(400).json({ message: "kamu gagal masukan file logo dan video" });
            }

            const namaLogo = `${Date.now()}${path.extname(logo.name)}`;
            const fileLogo = path.join(__dirname, '../../public/campeni-profile', namaLogo);
            await logo.mv(fileLogo);

            const namaVideo = `${Date.now()}${path.extname(video.name)}`;
            const fileVideo = path.join(__dirname, '../../public/campeni-profile', namaVideo);
            await video.mv(fileVideo);

            const dataDetail = await CampeniProfileMBG.findOne({ _id: req.params.id })
            if (!dataDetail) return res.status(404).json({ message: 'data Not Found' })

            const logoPayload = path.basename(dataDetail.logo);
            const deleteLogo = path.join(__dirname, '../../public/campeni-profile', logoPayload)

            if (fs.existsSync(deleteLogo)) {
                fs.unlinkSync(deleteLogo);
            }

            const videoPayload = path.basename(dataDetail.video);
            const deleteVideo = path.join(__dirname, '../../public/campeni-profile', videoPayload)

            if (fs.existsSync(deleteVideo)) {
                fs.unlinkSync(deleteVideo);
            }

            // const data = await CampeniProfileMBG.findByIdAndUpdate({ _id: req.params.id }, {
            //     navbarMenu: menu,
            //     herosectionTitel,
            //     herosectionDescription,
            //     about,
            //     visiDanMisi,
            //     contenBenefitTitel,
            //     contenBenefitDescription,
            //     peningkatanStatusGiziTitel,
            //     // peningkatanStatusGiziDescription: statusGizi,
            //     mendukungPertumbuhanTitel,
            //     // mendukungPertumbuhanDescription: pertumbuhan,
            //     meningkatkanPerekonomianTitel,
            //     // meningkatkanPerekonomianDescription: perekonomian,
            //     produkKamiTitel,
            //     produkKamiDescription,
            //     aplikasiTitel,
            //     aplikasiDescription,
            //     titelVisiDanMisi,
            //     logo: `${process.env.HOST}public/campeni-profile/${namaLogo}`,
            //     video: `${process.env.HOST}public/campeni-profile/${namaVideo}`
            // }, { new: true })

            res.status(201).json({
                message: 'update not found',
                // data
            })
        } catch (error) {
            console.error(error);
            if (error && error.name === 'ValidationError') {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                    fields: error.errors
                });
            }
            next(error);
        }
    }
}
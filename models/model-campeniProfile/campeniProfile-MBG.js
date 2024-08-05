const mongoose = require('mongoose')

const ModelCampeniprofileMBG = new mongoose.Schema({
    logo: {
        type: String,
        required: [true, "logo harus di isi"]
    },
    navbarMenu: [{
        type: String,
        required: [true, "navbarMenu harus di isi"]
    }],
    herosectionTitel: {
        type: String,
        required: [true, "herosection harus di isi"]
    },
    herosectionDescription: {
        type: String,
        required: [true, "herosectionDescription harus di isi"]
    },
    video: {
        type: String,
        required: [true, "video harus di isi"]
    },
    about: {
        type: String,
        required: [true, "about harus di isi"]
    },
    visiDanMisi: {
        type: String,
        required: [true, "visiDanMisi harus di isi"]
    },
    contenBenefitTitel: {
        type: String,
        required: [true, "contenBenefit titel harus di isi"]
    },
    contenBenefitDescription: {
        type: String,
        required: [true, "contenBenefit description harus di isi"]
    },

    peningkatanStatusGiziTitel: {
        type: String,
        required: [true, "peningkatanStatusGizi titel harus di isi"]
    },
    peningkatanStatusGiziDescription: [{
        title: {
            type: String,
            required: [true, " title peningkatanStatusGizi description harus di isi"]
        },
        description: {
            type: String,
            required: [true, " description peningkatanStatusGizi description harus di isi"]
        }
    }],
    mendukungPertumbuhanTitel: {
        type: String,
        required: [true, "mendukungPertumbuhan titel harus di isi"]
    },
    mendukungPertumbuhanDescription: [{
        title: {
            type: String,
            required: [true, "title mendukungPertumbuhan description harus di isi"]
        },
        description: {
            type: String,
            required: [true, "description mendukungPertumbuhan description harus di isi"]
        }
    }],
    meningkatkanPerekonomianTitel: {
        type: String,
        required: [true, "meningkatkanPerekonomian titel harus di isi"]
    },
    meningkatkanPerekonomianDescription: [{
        title: {
            type: String,
            required: [true, "title meningkatkanPerekonomian description harus di isi"]
        },
        description: {
            type: String,
            required: [true, "description meningkatkanPerekonomian description harus di isi"]
        }
    }],
    produkKamiTitel: {
        type: String,
        required: [true, "produkKami titel harus di isi"]
    },
    produkKamiDescription: {
        type: String,
        required: [true, "produkKami description harus di isi"]
    },
    aplikasiTitel: {
        type: String,
        required: [true, "aplikasi titel harus di isi"]
    },
    aplikasiDescription: {
        type: String,
        required: [true, "aplikasi description harus di isi"]
    },
    titelVisiDanMisi: {
        type: String,
        required: [true, "titel Visi Dan Misi harus di isi"]
    }
})

const CampeniProfileMBG = mongoose.model('CampeniProfileMBG', ModelCampeniprofileMBG)

module.exports = CampeniProfileMBG
const mongoose = require("mongoose");

const modelGratong = new mongoose.Schema({
    jenis:{
        type: String,
        enum: ["persentase", "langsung"],
        required: true
    },
    tarif:{
        type: mongoose.Types.ObjectId,
        ref: "Tarif",
        required: true
    },
    nilai_gratong:{
        type: Number,
        required: true
    },
    startTime:{
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    nama: {
        type: String,
        required: true
    }
});

modelGratong.pre('save', function(next){
    if(this.jenis === "persentase" && this.nilai_gratong > 100){
        return next("Persentase yang diizinkan hanya sampai 100%");
    }

    next()
});

const Gratong = mongoose.model("Gratong", modelGratong);

module.exports = Gratong;
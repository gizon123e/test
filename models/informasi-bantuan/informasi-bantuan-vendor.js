const mongoose = require('mongoose')

const modelInformasiBantuanVendor = new mongoose.Schema({
    sebagai_pembeli: {
        judul_utama: {
            type: String
        },
        judul_sub: {
            type: String
        },
        pertanyaan: [{
            soal: {
                type: String
            },
            jawab: {
                type: String
            },
            sub_jawab: [{
                type: String
            }]
        }]
    },

    sebagai_penjual: {
        judul_utama: {
            type: String
        },
        judul_sub: {
            type: String
        },
        pertanyaan: [{
            soal: {
                type: String
            },
            jawaban_satu: {
                type: String
            },
            lis_jawaban: [{
                type: String
            }],
            jawaban_dua: {
                type: String
            },
        }]
    },

    akun_dan_aplikasi: {
        judul_utama: {
            type: String
        },
        judul_sub: {
            type: String
        },
        pertanyaan_satu: {
            soal: {
                type: String
            },
            jawaban_satu: {
                type: String
            },
            sub_list_jawaban: [{
                type: String
            }],
            jawaban_dua: {
                type: String
            }
        },

        pertanyaan_dua: {
            soal: {
                type: String
            },
            jawaban_satu: {
                type: String
            },
            sub_list_jawaban: [{
                sub_jawaban: {
                    type: String
                },
                sub_detail_jawaban: [{
                    type: String
                }]
            }],

        },

        pertanyaan_tiga: [{
            soal: {
                type: String
            },
            jawaban_satu: {
                type: String
            },
            sub_list_jawaban: [{
                type: String
            }]
        }]
    },

    register: {
        judul_utama: {
            type: String
        },
        pertanyaan: [{
            soal: {
                type: String,
            },
            jawaban: {
                type: String,
            }
        }]
    },

    toko: {
        judul_utama: {
            type: String
        },
        judul_sub: {
            type: String
        },
        pertanyaan: [{
            soal: {
                type: String,
            },
            jawaban: {
                type: String,
            },
            list_jawaban: [{
                type: String,
            }],
            description: {
                type: String,
            },
        }]
    },

    analisis_toko: {
        judul_utama: {
            type: String
        },
        pertanyaan: [{
            soal: {
                type: String,
            },
            jawaban: {
                type: String,
            },
            list_jawaban: [{
                type: String,
            }]
        }]
    },

    kendala_toko: {
        judul_utama: {
            type: String
        },
        pertanyaan: [{
            soal: {
                type: String,
            },
            jawaban: {
                type: String,
            }
        }]
    },

    reputasi_toko: {
        judul_utama: {
            type: String
        },
        pertanyaan: [{
            soal: {
                type: String,
            },
            jawaban: {
                type: String,
            }
        }]
    },

    produk: {
        judul_utama: {
            type: String
        },
        pertanyaan_satu: {
            soal: {
                type: String,
            },
            jawaban: {
                type: String,
            },
            list_jawaban: [{
                type: String,
            }]
        },
        pertanyaan_dua: {
            soal: {
                type: String,
            },
            jawaban: {
                type: String,
            },
        }
    },

    kendala_pesanan: {
        judul_utama: {
            type: String
        },
        pertanyaan: [{
            soal: {
                type: String,
            },
            jawaban: {
                type: String,
            }
        }]
    },

    rating_dan_ulasan: {
        judul_utama: {
            type: String
        },
        pertanyaan_satu: {
            soal: {
                type: String,
            },
            jawaban: {
                type: String,
            },
        },
        pertanyaan_dua: {
            soal: {
                type: String,
            },
            jawaban: {
                type: String,
            },
            sub_jawaban: [{
                type: String,
            }]
        }
    },

    promosi: {
        judul_utama: {
            type: String
        },
        pertanyaan: [{
            soal: {
                type: String
            },
            jawaban: {
                type: String
            },
            list_jawaban: [{
                type: String
            }]
        }]
    },

    keuangan: {
        judul_utama: {
            type: String
        },
        judul_sub: {
            type: String
        },
        pertanyaan: [{
            soal: {
                type: String
            },
            jawaban: {
                type: String
            }
        }]
    },

    penghasilan: {
        judul_utama: {
            type: String
        },
        pertanyaan: [{
            soal: {
                type: String
            },
            jawaban: {
                type: String
            }
        }]
    },

    pengiriman: {
        judul_utama: {
            type: String
        },
        pertanyaan: [{
            soal: {
                type: String
            },
            jawaban: {
                type: String
            }
        }]
    }
}, { timeseries: true })

const InformasiBantuanVendor = mongoose.model('lInformasiBantuanVendor', modelInformasiBantuanVendor)
module.exports = InformasiBantuanVendor
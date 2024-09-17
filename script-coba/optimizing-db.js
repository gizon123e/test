require('../database/database');
const User = require("../models/model-auth-user");
const mongoose = require("mongoose")
const Product = require('../models/model-product')
const fs = require('fs');
const SimulasiSekolah = require('../models/model-simulasi-sekolah');

const dataSekolah = [
    {
      namaSekolah: "SDN Harapan",
      NPSN: 10101010,
      jumlahMurid: 180,
      kelas: [
        { namaKelas: "1", jumlahMuridKelas: 30 },
        { namaKelas: "2", jumlahMuridKelas: 30 },
        { namaKelas: "3", jumlahMuridKelas: 30 },
        { namaKelas: "4", jumlahMuridKelas: 30 },
        { namaKelas: "5", jumlahMuridKelas: 30 },
        { namaKelas: "6", jumlahMuridKelas: 30 }
      ],
      jenisPendidikan: "formal",
      statusSekolah: "negeri",
      jenjangPendidikan: "pendidikan dasar",
      satuanPendidikan: "SD"
    },
    {
      namaSekolah: "SMP Negeri 1",
      NPSN: 20202020,
      jumlahMurid: 120,
      kelas: [
        { namaKelas: "7", jumlahMuridKelas: 40 },
        { namaKelas: "8", jumlahMuridKelas: 40 },
        { namaKelas: "9", jumlahMuridKelas: 40 }
      ],
      jenisPendidikan: "formal",
      statusSekolah: "negeri",
      jenjangPendidikan: "pendidikan menengah",
      satuanPendidikan: "SMP"
    },
    {
      namaSekolah: "SMA Merdeka",
      NPSN: 30303030,
      jumlahMurid: 105,
      kelas: [
        { namaKelas: "10", jumlahMuridKelas: 35 },
        { namaKelas: "11", jumlahMuridKelas: 35 },
        { namaKelas: "12", jumlahMuridKelas: 35 }
      ],
      jenisPendidikan: "formal",
      statusSekolah: "swasta",
      jenjangPendidikan: "pendidikan menengah",
      satuanPendidikan: "SMA"
    },
    {
      namaSekolah: "TK Bunga",
      NPSN: 40404040,
      jumlahMurid: 45,
      kelas: [
        { namaKelas: "A", jumlahMuridKelas: 20 },
        { namaKelas: "B", jumlahMuridKelas: 25 }
      ],
      jenisPendidikan: "formal",
      statusSekolah: "swasta",
      jenjangPendidikan: "pendidikan anak usia dini",
      satuanPendidikan: "TK"
    },
    {
      namaSekolah: "RA Al-Hidayah",
      NPSN: 50505050,
      jumlahMurid: 50,
      kelas: [
        { namaKelas: "A", jumlahMuridKelas: 22 },
        { namaKelas: "B", jumlahMuridKelas: 28 }
      ],
      jenisPendidikan: "formal",
      statusSekolah: "swasta",
      jenjangPendidikan: "pendidikan anak usia dini",
      satuanPendidikan: "RA"
    },
    {
      namaSekolah: "MI Nurul Huda",
      NPSN: 60606060,
      jumlahMurid: 180,
      kelas: [
        { namaKelas: "1", jumlahMuridKelas: 30 },
        { namaKelas: "2", jumlahMuridKelas: 30 },
        { namaKelas: "3", jumlahMuridKelas: 30 },
        { namaKelas: "4", jumlahMuridKelas: 30 },
        { namaKelas: "5", jumlahMuridKelas: 30 },
        { namaKelas: "6", jumlahMuridKelas: 30 }
      ],
      jenisPendidikan: "formal",
      statusSekolah: "swasta",
      jenjangPendidikan: "pendidikan dasar",
      satuanPendidikan: "MI"
    },
    {
      namaSekolah: "SMK Pelita",
      NPSN: 70707070,
      jumlahMurid: 105,
      kelas: [
        { namaKelas: "10", jumlahMuridKelas: 35 },
        { namaKelas: "11", jumlahMuridKelas: 35 },
        { namaKelas: "12", jumlahMuridKelas: 35 }
      ],
      jenisPendidikan: "formal",
      statusSekolah: "swasta",
      jenjangPendidikan: "pendidikan menengah",
      satuanPendidikan: "SMK"
    },
    {
      namaSekolah: "PAUD Ceria",
      NPSN: 80808080,
      jumlahMurid: 40,
      kelas: [
        { namaKelas: "A", jumlahMuridKelas: 18 },
        { namaKelas: "B", jumlahMuridKelas: 22 }
      ],
      jenisPendidikan: "non-formal",
      statusSekolah: "swasta",
      jenjangPendidikan: "pendidikan anak usia dini",
      satuanPendidikan: "PAUD"
    },
    {
      namaSekolah: "SD Cendekia",
      NPSN: 90909090,
      jumlahMurid: 180,
      kelas: [
        { namaKelas: "1", jumlahMuridKelas: 30 },
        { namaKelas: "2", jumlahMuridKelas: 30 },
        { namaKelas: "3", jumlahMuridKelas: 30 },
        { namaKelas: "4", jumlahMuridKelas: 30 },
        { namaKelas: "5", jumlahMuridKelas: 30 },
        { namaKelas: "6", jumlahMuridKelas: 30 }
      ],
      jenisPendidikan: "formal",
      statusSekolah: "negeri",
      jenjangPendidikan: "pendidikan dasar",
      satuanPendidikan: "SD"
    },
    {
      namaSekolah: "MTS Islamiyah",
      NPSN: 10111212,
      jumlahMurid: 120,
      kelas: [
        { namaKelas: "7", jumlahMuridKelas: 40 },
        { namaKelas: "8", jumlahMuridKelas: 40 },
        { namaKelas: "9", jumlahMuridKelas: 40 }
      ],
      jenisPendidikan: "formal",
      statusSekolah: "swasta",
      jenjangPendidikan: "pendidikan menengah",
      satuanPendidikan: "MTS"
    }
  ];
  

async function blah(){
    const promisesFunct = []
    for(const sekolah of dataSekolah){
        promisesFunct.push(
            SimulasiSekolah.create(sekolah)
        );
    };
    Promise.all(promisesFunct).then(()=> console.log('berhasil membuat data'))
}

blah()
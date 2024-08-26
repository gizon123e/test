const Konsumen = require("../../models/konsumen/model-konsumen");
const PicKonsumen = require("../../models/konsumen/model-penanggung-jawab");
const User = require("../../models/model-auth-user");
const Address = require("../../models/model-address");
const Sekolah = require("../../models/model-sekolah");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const fs = require("fs");
const mongoose = require("mongoose");
const Follower = require("../../models/model-follower");
const TokoVendor = require("../../models/vendor/model-toko");
const { calculateDistance } = require("../../utils/menghitungJarak");
const BiayaTetap = require("../../models/model-biaya-tetap");
const Product = require("../../models/model-product");
const PoinHistory = require("../../models/model-poin");

module.exports = {
  getAllKonsumen: async (req, res, next) => {
    try {
      const dataKonsumen = await Konsumen.find()
        .populate("userId", "-password")
        .populate("addressId");
      if (!dataKonsumen || dataKonsumen.length === 0)
        return res
          .status(404)
          .json({ message: "Tidak ada Konsumen terdaftar" });
      return res.status(200).json({
        message: "get data all Konsumen success",
        datas: dataKonsumen,
      });
    } catch (error) {
      if (error && error.name === "ValidationError") {
        return res.status(400).json({
          error: true,
          message: error.message,
          fields: error.fields,
        });
      }
      next(error);
    }
  },

  tokoFavorit: async (req, res, next) => {
    try {
      if(req.user.role !== 'konsumen') return res.status(400).json({message: "konsumen only endpoint"})

      const pengikut = await Follower.find({ userId: req.user.id }).lean();
      const data = await Promise.all(
        pengikut.map(async (pgt) => {
          const { sellerUserId } = pgt;
          const detail = await TokoVendor.findOne({ userId: sellerUserId })
            .select("address profile_pict namaToko userId")
            .populate({ path: "address", select: "province" })
            .lean();
          return { ...detail, follow: true };
        })
      );
      return res
        .status(200)
        .json({ message: "Mendapatkan semua toko yang diikuti", data });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  rekomendasiToko: async (req, res, next) => {
    try {
      if(req.user.role !== 'konsumen') return res.status(400).json({message: "konsumen only endpoint"})

      const addressUsed = await Address.findOneAndUpdate(
        { userId: req.user.id, isUsed: true }
      ).select("pinAlamat");
      
      const biayaTetap = await BiayaTetap.findOne({}).select("radius");
  
      const pengikut = (await Follower.find({ userId: req.user.id }).lean())
        .map(fl => fl.sellerUserId);
  
      let toko = await TokoVendor.find({ userId: { $nin: pengikut } })
        .select("address profile_pict namaToko userId")
        .populate({ path: "address", select: "province pinAlamat" })
        .lean();
  
      toko = await Promise.all(toko.map(async (toko) => {
        const userLat = parseFloat(addressUsed?.pinAlamat?.lat);
        const userLong = parseFloat(addressUsed?.pinAlamat?.long);
        const tokoLat = parseFloat(toko?.address?.pinAlamat?.lat);
        const tokoLong = parseFloat(toko?.address?.pinAlamat?.long);
        
        const produks = await Product.countDocuments({
          userId: toko.userId,  
          'status.value': 'terpublish'
        });
        
        let jarak = null;
        if (userLat && userLong && tokoLat && tokoLong) {
          jarak = calculateDistance(userLat, userLong, tokoLat, tokoLong, biayaTetap.radius);
        }
  
        // Return the toko object if it meets the conditions
        if (!isNaN(jarak) && produks > 0) {
          return toko;
        } else {
          return null;
        }
      }));
  
      // Filter out any null entries
      toko = toko.filter(tk => tk !== null);
  
      // Add 'followed' status to each toko
      const data = await Promise.all(toko.map(async (tk) => {
        const followed = await Follower.exists({ userId: req.user.id, sellerUserId: tk.userId });
        return {
          ...tk,
          followed: !!followed
        };
      }));
  
      return res.status(200).json({ message: "Berhasil mendapatkan rekomendasi toko", data });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  
  getDetailKonsumen: async (req, res, next) => {
    try {
      const dataKonsumen = await Konsumen.findOne({ userId: req.user.id })
        .select(
          "-nomorAktaPerusahaan -file_ktp -nik -npwpFile -nomorNpwpPerusahaan -nomorNpwp -legalitasBadanUsaha"
        )
        .populate("userId", "-password")
        .populate("address")
        .lean();
      const defaultAddress = await Sekolah.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(req.user.id),
          },
        },
        {
          $project: { namaSekolah: 1, address: 1 },
        },
        {
          $lookup: {
            from: "addresses",
            let: { address: "$address" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$address"] },
                  isUsed: true,
                },
              },
              {
                $project: { isPic: 0, isMain: 0, isSchool: 0, userId: 0 },
              },
            ],
            as: "defaultAddress",
          },
        },
        {
          $unwind: "$defaultAddress",
        },
      ]);
      // res.status(200).json(defaultAddress);
      let pic;
      const poin = await PoinHistory.find({userId: req.user.id});
      if (!dataKonsumen)
        return res
          .status(404)
          .json({ error: `data Konsumen id :${req.user.id} not Found` });
      let modifiedDataKonsumen = { 
        ...dataKonsumen, 
        poin: poin.length > 0 ? 
          poin
            .filter(pn => pn.jenis === "masuk")
            .reduce((acc, val)=> acc + val.value, 0) - 
          poin
            .filter(pn => pn.jenis === "keluar")
            .reduce((acc, val)=> acc + val.value, 0)
        : 0
      };
      const isIndividu = dataKonsumen.nama ? true : false;
      if (isIndividu) {
        pic = null;
        modifiedDataKonsumen = {
          ...modifiedDataKonsumen,
          pic,
        };
      }
      if (!isIndividu) {
        pic = await PicKonsumen.findOne({
          userId: req.user.id,
          detailId: dataKonsumen._id,
        });
        const { namaBadanUsaha, ...rest } = dataKonsumen;
        modifiedDataKonsumen = {
          ...rest,
          nama: namaBadanUsaha,
          pic,
        };
      }
      return res.status(200).json({
        message: "success",
        datas: modifiedDataKonsumen,
        defaultAddress: defaultAddress,
        isIndividu,
      });
    } catch (error) {
      if (error && error.name === "ValidationError") {
        return res.status(400).json({
          error: true,
          message: error.message,
          fields: error.fields,
        });
      }
      console.log(error);
      next(error);
    }
  },

  createKonsumen: async (req, res, next) => {
    try {
      const samaUser = await Konsumen.findOne({ userId: req.body.id }).populate(
        "userId",
        "-password",
        "-codeOtp",
        "-saldo",
        "-poin"
      );

      if (samaUser)
        return res.status(400).json({
          message: "User ini sudah memiliki data detail Konsumen",
          data: samaUser,
        });

      const {
        nama,
        namaBadanUsaha,
        nomorAktaPerusahaan,
        noTeleponKantor,
        registerAs,
        province,
        regency,
        district,
        village,
        code_pos,
        address_description,
        long_pin_alamat,
        lat_pin_alamat,
        nomorNpwpPerusahaan,
        nik,
        nomorNpwp,
      } = req.body;

      const address = {
        province,
        regency,
        district,
        village,
        code_pos,
        address_description,
        pinAlamat: {
          long: long_pin_alamat,
          lat: lat_pin_alamat,
        },
        isMain: true,
        isUsed: true,
      };

      if (registerAs === "not_individu") {
        let missingFields = [];
        if (!namaBadanUsaha) missingFields.push("namaBadanUsaha");
        if (!nomorAktaPerusahaan) missingFields.push("nomorAktaPerusahaan");
        if (!noTeleponKantor) missingFields.push("noTeleponKantor");
        if (!req.files?.legalitasBadanUsaha)
          missingFields.push("legalitasBadanUsaha");
        if (!req.files?.npwpFile) missingFields.push("npwpFile");
        if (!province) missingFields.push("province");
        if (!regency) missingFields.push("regency");
        if (!district) missingFields.push("district");
        if (!village) missingFields.push("village");
        if (!code_pos) missingFields.push("code_pos");
        if (!address_description) missingFields.push("address_description");
        if (!long_pin_alamat) missingFields.push("long_pin_alamat");
        if (!lat_pin_alamat) missingFields.push("lat_pin_alamat");
        if (!nomorNpwpPerusahaan) missingFields.push("nomorNpwpPerusahaan");

        if (missingFields.length > 0) {
          return res.status(403).json({
            message: "Data Kurang Lengkap",
            missingFields: missingFields,
          });
        }
      }

      if (registerAs === "individu") {
        let missingFields = [];

        if (namaBadanUsaha)
          missingFields.push("Nama Badan Usaha tidak seharusnya diisi");
        if (nomorAktaPerusahaan)
          missingFields.push("Nomor Akta Perusahaan tidak seharusnya diisi");
        if (noTeleponKantor)
          missingFields.push("Nomor Telepon Kantor tidak seharusnya diisi");
        if (nomorNpwpPerusahaan)
          missingFields.push("Nomor NPWP Perusahaan tidak seharusnya diisi");
        if (req.files?.legalitasBadanUsaha)
          missingFields.push("Legalitas Badan Usah tidak seharusnya diisi");
        if (!nama) missingFields.push("Nama");
        if (!province) missingFields.push("Province");
        if (!regency) missingFields.push("Regency");
        if (!district) missingFields.push("District");
        if (!village) missingFields.push("Village");
        if (!code_pos) missingFields.push("Kode Pos");
        if (!address_description) missingFields.push("Deskripsi Alamat");
        if (!long_pin_alamat) missingFields.push("Longitude Alamat");
        if (!lat_pin_alamat) missingFields.push("Latitude Alamat");
        if (!nik) missingFields.push("NIK");
        if (!req.files?.file_ktp) missingFields.push("File KTP");
        if (req.files?.npwpFile && !nomorNpwp) missingFields.push("Nomor NPWP");
        if (!req.files?.npwpFile && nomorNpwp) missingFields.push("File NPWP");

        if (missingFields.length > 0) {
          return res.status(400).json({
            message: "Data yang dikirim kurang baik",
            missingFields,
          });
        }
      }

      const newAddress = await Address.create({
        ...address,
        userId: req.body.id,
      });
      async function dataMake() {
        if (registerAs === "not_individu") {
          const { legalitasBadanUsaha, npwpFile } = req.files;

          const legalitasFile = `${Date.now()}_${namaBadanUsaha}_${path.extname(
            legalitasBadanUsaha.name
          )}`;

          const legalitasPath = path.join(
            __dirname,
            "../../public",
            "legalitas-img",
            legalitasFile
          );

          await legalitasBadanUsaha.mv(legalitasPath);

          const npwp_file = `${Date.now()}_${namaBadanUsaha}_${path.extname(
            npwpFile.name
          )}`;

          const npwp_file_path = path.join(
            __dirname,
            "../../public",
            "npwp-img",
            npwp_file
          );

          await npwpFile.mv(npwp_file_path);
          return {
            userId: req.body.id,
            nomorAktaPerusahaan,
            noTeleponKantor,
            address: newAddress._id,
            nomorNpwpPerusahaan,
            namaBadanUsaha,
            pinAlamat: {
              long: long_pin_alamat,
              lat: lat_pin_alamat,
            },
            npwpFile: `${process.env.HOST}/public/npwp-img/${npwp_file}`,
            legalitasBadanUsaha: `${process.env.HOST}/public/legalitas-img/${legalitasFile}`,
          };
        }

        if (registerAs === "individu") {
          const { npwpFile, file_ktp } = req.files;
          let npwp_file;
          if (npwpFile) {
            npwp_file = `${Date.now()}_${nama}_${path.extname(npwpFile.name)}`;

            const npwp_file_path = path.join(
              __dirname,
              "../../public",
              "npwp-img",
              npwp_file
            );

            await npwpFile.mv(npwp_file_path);
          }
          const fileKtp = `${Date.now()}_ktp_of_${nama}_${path.extname(
            file_ktp.name
          )}`;
          const file_file_path = path.join(
            __dirname,
            "../../public",
            "image-ktp",
            fileKtp
          );
          await file_ktp.mv(file_file_path);
          return {
            userId: req.body.id,
            nama,
            address: newAddress._id,
            pinAlamat: {
              long: long_pin_alamat,
              lat: lat_pin_alamat,
            },
            file_ktp: `${process.env.HOST}/public/image-ktp/${fileKtp}`,
            nomorNpwp: req.body.nomorNpwp ? req.body.nomorNpwp : undefined,
            npwpFile: npwpFile
              ? `${process.env.HOST}/public/npwp-img/${npwp_file}`
              : undefined,
          };
        }
      }
      const data = await dataMake();

      const dataKonsumen = await Konsumen.create(data);

      return res.status(200).json({
        message: "Konsumen Successfully Created",
        data: dataKonsumen,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  updateKonsumen: async (req, res, next) => {
    try {
      const konsumen = await Konsumen.findOne({ userId: req.user.id });

      if (!konsumen)
        return res.status(404).json({ message: `User belum mengisi detail` });
      let filePath = konsumen.profile_pict;
      // if(req.body.noTeleponKantor){
      //     const regexNoTelepon = /\+62\s\d{3}[-\.\s]??\d{3}[-\.\s]??\d{3,4}|\(0\d{2,3}\)\s?\d+|0\d{2,3}\s?\d{6,7}|\+62\s?361\s?\d+|\+62\d+|\+62\s?(?:\d{3,}-)*\d{3,5}/
      //     if (!regexNoTelepon.test(req.body[noTeleponKantor].toString())) {
      //         return res.status(400).json({ error: 'no telepon tidak valid' })
      //     }
      // }

      if (req.files && req.files.profile_pict) {
        const name = konsumen.profile_pict
          ? konsumen.profile_pict.split("/")
          : "notfound";
        if (
          fs.existsSync(
            path.join(__dirname, "../../public", "profile_picts", name[5])
          )
        ) {
          console.log("ada");
          fs.unlink(
            path.join(__dirname, "../../public", "profile_picts", name[5]),
            (err) => {
              if (err) {
                console.error("Error while deleting file:", err);
              } else {
                console.log("File deleted successfully");
              }
            }
          );
        }
        const profile_pict_file = `${
          konsumen.namaBadanUsaha || konsumen.nama
        }_${Date.now()}${path.extname(req.files.profile_pict.name)}`;

        const profile_pict = path.join(
          __dirname,
          "../../public",
          "profile_picts",
          profile_pict_file
        );
        filePath = `${process.env.HOST}public/profile_picts/${profile_pict_file}`;
        await req.files.profile_pict.mv(profile_pict);
      }

      const updatedData = await Konsumen.findOneAndUpdate(
        { userId: req.user.id },
        {
          profile_pict: filePath,
          jenis_kelamin: req.body.jenis_kelamin
            ? req.body.jenis_kelamin
            : undefined,
          jenis_perusahaan: req.body.jenis_perusahaan
            ? req.body.jenis_perusahaan
            : undefined,
          tanggal_lahir: req.body.tanggal_lahir
            ? req.body.tanggal_lahir
            : undefined,
        },
        { new: true }
      );

      if (
        (updatedData.jenis_kelamin || updatedData.jenis_perusahaan) &&
        updatedData.tanggal_lahir
      )
        await User.findByIdAndUpdate(req.user.id, { isActive: true });

      return res.status(200).json({
        message: "Konsumen updated successfully",
        data: updatedData,
      });
    } catch (error) {
      if (error && error.name === "ValidationError") {
        return res.status(400).json({
          error: true,
          message: error.message,
          fields: error.fields,
        });
      }
      console.log(error);
      next(error);
    }
  },

  deleteKonsumen: async (req, res, next) => {
    try {
      const dataKonsumen = await Konsumen.findByIdAndDelete(req.params.id);
      if (!dataKonsumen) {
        return res
          .status(404)
          .json({ error: `data id ${req.params.id} not found` });
      }
      return res.status(200).json({ message: "delete data Konsumen success" });
    } catch (error) {
      if (error && error.name === "ValidationError") {
        return res.status(400).json({
          error: true,
          message: error.message,
          fields: error.fields,
        });
      }
      next(error);
    }
  },
};

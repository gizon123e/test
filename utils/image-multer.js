const multer = require('multer')
const path = require('path')
const fs = require('fs').promises;

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const { image_ktp, image_sim } = req.body;
        if (file.fieldname === 'image_ktp') {
            cb(null, path.join(__dirname, '..', 'uploads', 'image_ktp'));
        } else if (file.fieldname === 'image_sim') {
            cb(null, path.join(__dirname, '..', 'uploads', 'image_sim'));
        } else {
            cb(new Error('Invalid file fieldname'), null);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
})

// Filter untuk memeriksa tipe file yang diunggah
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Multer instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5 MB
    }
});


const updateImage = async (req, fieldname, oldImageName) => {
    try {
        // Hapus gambar lama jika ada
        if (oldImageName) {
            const imagePath = path.join(__dirname, '..', 'uploads', fieldname, oldImageName);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // Simpan gambar baru
        const { file } = req;
        if (file) {
            const ext = path.extname(file.originalname);
            const newImageName = file.fieldname + '-' + Date.now() + ext;
            const newImagePath = path.join(__dirname, '..', 'uploads', fieldname, newImageName);
            await fs.promises.rename(file.path, newImagePath);
            return newImageName;
        }

        return null; // Jika tidak ada gambar yang diupload
    } catch (error) {
        throw new Error('Failed to update image: ' + error.message);
    }
};


module.exports = { upload, updateImage }
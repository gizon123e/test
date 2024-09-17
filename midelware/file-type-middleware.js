const path = require('path');
module.exports = async (req, res, next) => {
    try {
        if (!req.files || !req.files.ImageProduct || req.files.ImageProduct.length === 0) return res.status(400).json({ message: "Minimal Punya 1 Foto, kirimkan file foto dengan nama ImageProduct" });
        const allowedTypes = [".jpg", ".png", ".jpeg"];
        if(req.files || req.files.length > 0){
            Object.keys(req.files).forEach((key, i)=>{
                if(Array.isArray(req.files[key])){
                    req.files[key].forEach((e)=>{
                        if(!allowedTypes.includes(path.extname(e.name))) throw new Error("Invalid File Type");
                    });
                }else{
                    if(!allowedTypes.includes(path.extname(req.files[key].name))) throw new Error("Invalid File Type");
                }
            })
        }
        next()
    } catch (error) {
        next(error);
    }
}
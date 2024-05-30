module.exports = (err, req, res, next) => {
    const validateError = {
        error: true,
        method: req.method,
        url: req.url
    }
    // console.log(err)
    if (err.name === 'JsonWebTokenError') return res.status(401).json({ ...validateError, message: 'Authentication failed' });

    if (err.code && err.message) return res.status(err.code).json({ ...validateError, message: err.message });

    if(err=="Error: Invalid Token") return res.status(403).json({ ...validateError, message: "Token Invalid" });

    if(err=="Error: Token has expired") return res.status(403).json({ ...validateError, message: "Token Sudah Kadaluarsa" });

    if(err=="Error: Tidak Bisa mengedit Flash Sale yang Sedang Berlangsung") return res.status(403).json({...validateError, message: "Tidak Bisa mengedit Flash Sale yang Sedang Berlangsung"})
    if(err=="Error: Tidak Bisa mengedit Flash Sale yang Sudah Berlangsung") return res.status(403).json({...validateError, message: "Tidak Bisa mengedit Flash Sale yang Sudah Berlangsung"})

    // if(err="Error: Invalid File Type") return res.status(400).json({ ...validateError , message: "Gambar yang dikirimkan harus berupa jpg, png, atau jpeg"});

    res.status(500).json({ ...validateError, message: 'internal server error', error: err })
}
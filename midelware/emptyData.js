module.exports = (req, res, next) => {
  Object.keys(req.body).forEach((e) => {
    if (!req.body[e])
      return res.status(400).json({
        message: `Tidak Boleh Ada Properti yang Kosong atau Null. Empty Properti: ${e}. Jika tidak bermaksud memakai properti tersebut tolong jangan disimpan di payloadnya :D`,
      });
  });
  next();
};

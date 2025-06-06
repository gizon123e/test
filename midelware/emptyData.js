module.exports = (req, res, next) => {
  if(Object.keys(req.body).length === 0) return res.status(400).json({message:"Request Body Tidak Boleh Kosong", data_yang_dikirim: req.body})
  Object.keys(req.body).forEach((e) => {
    if (
      !req.body[e] ||
      (Array.isArray(req.body[e]) && req.body[e].length === 0) ||
      (typeof req.body[e] === "string" && req.body[e].trim().length < 1)
    ) {
      return res.status(400).json({
        message: `Tidak Boleh Ada Properti yang Kosong atau Null. Empty Properti: ${e}. Jika tidak bermaksud memakai properti tersebut tolong jangan disimpan di payloadnya :D`,
      });
    }
  });

  next();
};

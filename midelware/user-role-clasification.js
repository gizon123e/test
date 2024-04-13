const User = require("../models/model-auth-user");
module.exports = {
  seller: async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user)
        return res
          .status(404)
          .json({
            error: true,
            message: `User dengan id: ${req.user.id} tidak ditemukan`,
          });
      if (user.role.toLowerCase() == "konsumen") {
        return res
          .status(403)
          .json({ error: true, message: "Konsumen tidak bisa manage produk" });
      }
      next();
    } catch (error) {
      next(error);
    }
  },
  vendor: async(req, res, next)=>{
    try {
        const user = await User.findById(req.user.id);
        if (!user)
          return res
            .status(404)
            .json({
              error: true,
              message: `User dengan id: ${req.user.id} tidak ditemukan`,
            });
        if (user.role.toLowerCase() == !"konsumen") {
          return res
            .status(403)
            .json({ error: true, message: "Hanya Vendor yang bisa mengedit pemasok" });
        }
        next();
      } catch (error) {
        next(error);
      }
  }
};

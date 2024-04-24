const jwt = require("jsonwebtoken");

const config = require("../config/config-env");
console.log(config.secretKey);

module.exports = {
  createToken: (token) => {
    //masih development jadngan dlu dikasih expires
    return jwt.sign(token, config.secretKey);
  },
  verifyToken: (token) => {
    try {
      return jwt.verify(token, config.secretKey);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new Error("Token has expired");
      } else {
        throw new Error("Invalid Token");
      }
    }
  },
};

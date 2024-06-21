const jwt = require("jsonwebtoken");
const { request, response } = require("express");

const User = require("../models/userModel");

const validarJWT = async (req = request, res = response, next) => {
  const token = req.header("x-token");
  if (!token) {
    return res.status(400).json({ msg: "Falta token" });
  }
  try {
    const { id } = jwt.verify(token, process.env.SECRET);
    const user = await User.findById(id);
    if (!user) {
      return res.status(401).json({ msg: "Token no valido - user not found" });
    }
    if (!user.status) {
      return res.status(401).json({ msg: "Token no valido - user inactive" });
    }
    req.userAuth = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ msg: "Token no valido" });
  }
};

module.exports = { validarJWT };

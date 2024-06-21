const bcryptjs = require("bcryptjs");
const { request, response } = require("express");

const { generarJWT } = require("../helpers/generarJWT");
const User = require("../models/userModel");

const login = async (req = request, res = response) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username:username.toLowerCase() });

  if (!user) {
    return res.status(401).json({ message: "Datos incorrectos." });
  }

  if (!user.status) {
    return res.status(401).json({ message: "Datos incorrectos." });
  }
  
  const validPassword = bcryptjs.compareSync(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ message: "Datos incorrectos." });
  }
 
  const token = await generarJWT(user.id);
  if(!token){
    return res.status(500).json({ message: "Ocurrió un error inesperado." });
  }

  return res.json({ message: "OK", user, token });
};

module.exports = { login };
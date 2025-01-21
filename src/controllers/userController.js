const bcryptjs = require("bcryptjs");
const { request, response } = require("express");

const User = require("../models/userModel");

const getUsers = async (req = request, res = response) => {
  const users = await User.find({status: true});
  res.json(users);
};

const newUser = async (req = request, res = response) => {
  const { username, password, role } = req.body;
  const user = new User(
    {
      username,
      password,
      role
    }
  );

  const salt = bcryptjs.genSaltSync();
  user.password = bcryptjs.hashSync(password, salt);
  user.save();
  res.status(201).json({ message: "OK" });
};

// const newUserr = async () => {
//   const username = 'mateitolohezic'
//   const password = 'Mateo123'
//   const role = 'ADMIN'
//   const user = new User(
//     {
//       username,
//       password,
//       role
//     }
//   );

//   const salt = bcryptjs.genSaltSync();
//   user.password = bcryptjs.hashSync(password, salt);
//   user.save();
//   console.log("Usuario creado exitosamente");
// };
module.exports = { getUsers, newUser };

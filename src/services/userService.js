const User = require("../models/userModel");

const getAllUsers = async () => {
  try {
    return await User.find();
  } catch (error) {
    throw error;
  }
};

module.exports = { getAllUsers };
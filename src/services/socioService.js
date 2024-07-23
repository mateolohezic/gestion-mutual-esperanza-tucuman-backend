const Socio = require("../models/socioModel");

const getAllSocios = async () => {
  try {
    return await Socio.find();
  } catch (error) {
    throw error;
  }
};

module.exports = { getAllSocios };
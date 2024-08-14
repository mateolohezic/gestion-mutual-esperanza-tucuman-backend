const Socio = require("../models/socioModel");
const moment = require('moment-timezone');
require('moment/locale/es');
moment.locale('es');

const getAllSocios = async () => {
  try {
    return await Socio.find({status:true});
  } catch (error) {
    throw error;
  }
};

const getAllAliveSocios = async () => {
  try {
    return await Socio.find({status:true, alive: true});
  } catch (error) {
    throw error;
  }
};

const getAllSociosSimple = async () => {
  try {
    const socios = await Socio.find({status:true});
    const simpleSocios = socios.map( socio => {
      return socio.simple();
    });
    return simpleSocios;
  } catch (error) {
    throw error;
  }
};

const getSocioById = async (id) => {
  try {
    const socio = await Socio.findById(id);
    return socio.status ? socio : null;
  } catch (error) {
    throw error;
  }
};

const getSocioBySocioId = async (idSocio) => {
  try {
    const socio = await Socio.findOne({idSocio});
    return socio.status ? socio : null;
  } catch (error) {
    throw error;
  }
};

const getNewSocioId = async () => {
  const lastSocio = await Socio.findOne().sort({ idSocio: -1 });
  return lastSocio ? lastSocio.idSocio + 1 : 1;
};

const updateSocio = async (id, payload) => {
  try {
    const updatedSocio = await Socio.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true
    });
    return updatedSocio;
  } catch (error) {
    throw error;
  }
};

const createQuotaForNewSocio = () => {
  const currentDate = moment.tz('America/Argentina/Buenos_Aires');
  const currentMonth = currentDate.format('MMMM');
  const currentYear = currentDate.year();

  return {
    month: currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1),
    year: currentYear.toString(),
    quotaStatus: 'PENDING',
    datePayed: null,
  };
};

const createSocio = async (payload) => {
  try {
    const initialQuota = createQuotaForNewSocio();
    const socio = await Socio.create({
      ...payload,
      quotas: [initialQuota],
    });
    return socio;
  } catch (error) {
    throw error;
  }
};

module.exports = { getAllSocios, getAllAliveSocios, getAllSociosSimple, getSocioById, getSocioBySocioId, getNewSocioId, updateSocio, createSocio };
const Socio = require("../models/socioModel");
const socioService = require("../services/socioService");
const moment = require('moment-timezone');
require('moment/locale/es');
moment.locale('es');
const cron = require('node-cron');

const getAllSocios = async (req, res) => {
  try {
    const socios = await socioService.getAllSocios();
    return res.status(200).json({socios});
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAllSimpleSocios = async (req, res) => {
  try {
    const socios = await socioService.getAllSociosSimple();
    return res.status(200).json({socios});
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const newSocio = async (req, res) => {
  try {
    const { name, surname, dni, cuil, maritalStatus, birthdate, idSocio, fee, startDate, email, phonenumber, address, apartmentNumber, postalCode, town } = req.body;
    const payload = {
      name,
      surname,
      dni,
      cuil,
      maritalStatus,
      birthdate,
      idSocio,
      fee,
      startDate,
      email,
      phonenumber,
      address,
      apartmentNumber,
      postalCode,
      town,
    }

    const socio = await socioService.createSocio(payload);
    return res.status(201).json({socio});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

const getOneSocio = async (req, res) => {
  try {
    const { idSocio } = req.params;
    const socio = await socioService.getSocioBySocioId(idSocio);
    if (!socio) {
      return res.status(404).json({ error: "Socio no encontrado." });
    }
    return res.status(200).json(socio);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getNewSocioId = async (req, res) => {
  try {
    const newId = await socioService.getNewSocioId();
    return res.status(200).json({ newId });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
 
const updateSocio = async (req, res) => {
  try {
    const { id, name, surname, dni, cuil, maritalStatus, birthdate, fee, startDate, email, phonenumber, address, apartmentNumber, postalCode, town } = req.body;
    const payload = { name, surname, dni, cuil, maritalStatus, birthdate, fee, startDate, email, phonenumber, address, apartmentNumber, postalCode, town }
    
    const socio = await socioService.updateSocio(id, payload);

    if (!socio) {
      return res.status(404).json({ message: "Socio no encontrado" });
    }

    return res.json({socio});
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteSocio = async (req, res) => {
  try {
    const { id } = req.body;
    const socio = await socioService.updateSocio(id, { status: false });
    if (!socio) {
      return res.status(404).json({ message: "Socio no encontrado." });
    }
    return res.status(200).json({ message: "Socio eliminado con éxito." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deceasedSocio = async (req, res) => {
  try {
    const { id } = req.body;
    const socio = await socioService.updateSocio(id, { alive: false });
    if (!socio) {
      return res.status(404).json({ message: "Socio no encontrado." });
    }
    return res.status(200).json({ message: "Socio eliminado con éxito." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const markQuotaAsPaid = async (req, res) => {
  try {
    const { id, month, year } = req.body;
    const socio = await socioService.getSocioById(id);
    if (!socio) {
      return res.status(404).json({message:"Socio no encontrado"});
    }

    const quota = socio.quotas.find(q => q.month === month && q.year === year);
    if (!quota) {
      return res.status(404).json({message:"Cuota no encontrada"});
    }
    quota.quotaStatus = 'PAID';
    quota.datePayed = moment.tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD HH:mm:ss');

    updateSubscriptionStatus(socio);
    await socio.save();
    return res.status(200).json({message:"Cuota pagada con éxito."});
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const markQuotaAsUnpaid = async (req, res) => {
  try {
    const { id, month, year } = req.body;
    const socio = await socioService.getSocioById(id);
    if (!socio) {
      return res.status(404).json({message:"Socio no encontrado"});
    }

    const quota = socio.quotas.find(q => q.month === month && q.year === year);
    if (!quota) {
      return res.status(404).json({message:"Cuota no encontrada"});
    }
    quota.quotaStatus = 'PENDING';
    quota.datePayed = null;

    updateSubscriptionStatus(socio);
    await socio.save();
    return res.status(200).json({message:"Cuota pagada con éxito."});
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const addQuotaManually = async (req, res) => {
  const { id, month, year } = req.body
  try {
    const socio = await socioService.getSocioById(id);
    if (!socio) {
      return res.status(404).json({message:"Socio no encontrado"});
    }

    const existingQuota = socio.quotas.some(q => q.month === month && q.year === year);
    if (existingQuota) {
      return res.status(401).json({message:"La cuota para este mes y año ya existe"});
    }

    const newQuota = {
      month,
      year,
      quotaStatus: 'PENDING',
      datePayed: null,
    };
    socio.quotas.push(newQuota);
    await socio.save();

    return res.status(200).json({message:"Cuota añadida con éxito."});
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteQuota = async (req, res) => {
  try {
    const { id, month, year } = req.query
    const socio = await socioService.getSocioById(id);
    if (!socio) {
      return res.status(404).json({message:"Socio no encontrado."});
    }

    const updatedQuotas = socio.quotas.filter(
      (q) => !(q.month === month && q.year === year)
    );

    if (updatedQuotas.length === socio.quotas.length) {
      return res.status(404).json({message:"Cuota no encontrada."});
    }

    socio.quotas = updatedQuotas;
    updateSubscriptionStatus(socio);
    await socio.save();
    return res.status(200).json({message:"Cuota eliminada con éxito."});

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const markAllPendingQuotasAsExpired = (socio, currentMonth, currentYear) => {
  socio.quotas.forEach((quota) => {
    if (quota.quotaStatus === 'PENDING' && (quota.month !== currentMonth || quota.year !== currentYear)) {
      quota.quotaStatus = 'EXPIRED';
    }
  });
  return;
};

const addNewQuotaForCurrentMonth = (socio, currentMonth, currentYear) => {
  const quotaExists = socio.quotas.some(
    (q) => q.month === currentMonth && q.year === currentYear
  );
  if(quotaExists) return;

  const newQuota = {
    month: currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1),
    year: currentYear,
    quotaStatus: 'PENDING',
    datePayed: null,
  };

  socio.quotas.push(newQuota);
  return;
};

const updateSubscriptionStatus = (socio) => {
  const expiredQuotas = socio.quotas.filter(quota => quota.quotaStatus === 'EXPIRED');
  const expiredCount = expiredQuotas.length;
  if (expiredCount >= 4) {
    socio.subscriptionStatus = 'EXPIRED';
  } else if (expiredCount > 0) {
    socio.subscriptionStatus = 'EXPIRE_SOON';
  } else {
    socio.subscriptionStatus = 'ACTIVE';
  }
};

const updateMonthlySubscriptionStatus = (socio) => {
  const expiredQuotas = socio.quotas.filter((quota) => quota.quotaStatus === 'EXPIRED');
  const expiredCount = expiredQuotas.length;
  if (expiredCount >= 4) {
    socio.subscriptionStatus = 'EXPIRED';
  } else if (expiredCount > 0) {
    socio.subscriptionStatus = 'EXPIRE_SOON';
  } else {
    socio.subscriptionStatus = 'ACTIVE';
  }
  return
};

const processMonthlySociosQuotas = async () => {
  try {
    const currentDate = moment.tz('America/Argentina/Buenos_Aires');
    const currentMonth = currentDate.format('MMMM');
    const currentYear = currentDate.year().toString();

    const socios = await socioService.getAllAliveSocios();
    if(!socios || socios.length < 1){
      return
    }

    for (const socio of socios) {
      markAllPendingQuotasAsExpired(socio, currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1), currentYear);
      addNewQuotaForCurrentMonth(socio, currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1), currentYear);
      updateMonthlySubscriptionStatus(socio)
      await socio.save();
    }
    console.log('Proceso de cuotas completado.');
  } catch (error) {
    console.error('Error al procesar las cuotas de los socios:', error);
  }
};

cron.schedule(
  '0 0 1 * *',
  processMonthlySociosQuotas,
  { timezone: 'America/Argentina/Buenos_Aires' }
);

module.exports = {
  getAllSocios,
  getAllSimpleSocios,
  getNewSocioId,
  newSocio,
  getOneSocio,
  updateSocio,
  deceasedSocio,
  deleteSocio,
  markQuotaAsPaid,
  markQuotaAsUnpaid,
  addQuotaManually,
  deleteQuota
};
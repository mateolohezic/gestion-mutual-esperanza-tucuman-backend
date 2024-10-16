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

const getAllSociosSimpleFiltered = async (req, res) => {
  try {
    const { field, sort, search, month, year } = req.query;

    let socios = await socioService.getAllSociosSimple();

    if (search) {
      const searchParam = search.toLowerCase();
      socios = socios.filter((socio) => {
        const fullName = `${socio.name} ${socio.surname}`.toLowerCase();
        return (
          socio.name.toLowerCase().includes(searchParam) ||
          socio.surname.toLowerCase().includes(searchParam) ||
          socio.cuil.toLowerCase().includes(searchParam) ||
          socio.town.toLowerCase().includes(searchParam) ||
          socio.address.toLowerCase().includes(searchParam) ||
          fullName.includes(searchParam)
        );
      });
    }

    if (month || year) {
      socios = socios.filter((socio) => {
        const { lastQuota } = socio;
        if (!lastQuota) return false;
        const matchesMonth = month ? lastQuota.month === month : true;
        const matchesYear = year ? lastQuota.year === year : true;
        return matchesMonth && matchesYear;
      });
    }

    if (field && sort) {
      socios.sort((a, b) => {
        if (sort === 'asc') {
          return a[field] > b[field] ? 1 : -1;
        } else if (sort === 'desc') {
          return a[field] < b[field] ? 1 : -1;
        }
        return 0;
      });
    }

    return res.status(200).json({ socios });
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
    const { name, surname, dni, cuil, maritalStatus, birthdate, idSocio, fee, startDate, email, phonenumber, address, apartmentNumber, postalCode, town, observations } = req.body;
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
      observations
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
    const { id, name, surname, dni, cuil, maritalStatus, birthdate, fee, startDate, email, phonenumber, address, apartmentNumber, postalCode, town, observations } = req.body;
    const payload = {
      name,
      surname,
      dni,
      cuil,
      maritalStatus,
      birthdate,
      fee,
      startDate,
      email,
      phonenumber,
      address,
      apartmentNumber,
      postalCode,
      town,
      observations
    }
    
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
    const socio = await socioService.updateSocio(id, {
      alive: false,
      subscriptionStatus: 'DECEASED'
    });
    if (!socio) {
      return res.status(404).json({ message: "Socio no encontrado." });
    }
    return res.status(200).json({ message: "Estado del socio actualizado con éxito." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const markQuotaAsPaid = async (req, res) => {
  try {
    const { id, month, year, fee } = req.body;
    const socio = await socioService.getSocioById(id);
    if (!socio) {
      return res.status(404).json({message:"Socio no encontrado"});
    }

    const quota = socio.quotas.find(q => q.month === month && q.year === year);
    if (!quota) {
      return res.status(404).json({message:"Cuota no encontrada"});
    }

    quota.quotaStatus = 'PAID';
    quota.fee = parseFloat(fee);
    quota.datePayed = moment.tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD HH:mm:ss');

    updateSubscriptionStatus(socio);
    await socio.save();
    return res.status(200).json({message:"Cuota pagada con éxito."});
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const markExtraFeeAsPaid = async (req, res) => {
  try {
    const { id, month, year, extraFee } = req.body;
    const socio = await socioService.getSocioById(id);
    if (!socio) {
      return res.status(404).json({message:"Socio no encontrado"});
    }

    const quota = socio.quotas.find(q => q.month === month && q.year === year);
    if (!quota) {
      return res.status(404).json({message:"Cuota no encontrada"});
    }

    quota.extraFeePayed = true;
    quota.extraFee = parseFloat(extraFee);
    quota.extraDatePayed = moment.tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD HH:mm:ss');

    updateSubscriptionStatus(socio);
    await socio.save();
    return res.status(200).json({message:"Cuota extra pagada con éxito."});
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
    quota.extraFeePayed = false;
    quota.extraDatePayed = null;

    updateSubscriptionStatus(socio);
    await socio.save();
    return res.status(200).json({message:"Cuota pagada con éxito."});
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const markExtraFeeAsUnpaid = async (req, res) => {
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
    
    quota.extraFeePayed = false;
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
    console.log(error)
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
    socio.subscriptionStatus = 'EXPIRES_SOON';
  } else {
    socio.subscriptionStatus = 'ACTIVE';
  }
};

const updateMonthlySubscriptionStatus = (socio) => {
  if(socio.subscriptionStatus === 'DECEASED') return;

  const expiredQuotas = socio.quotas.filter((quota) => quota.quotaStatus === 'EXPIRED');
  const expiredCount = expiredQuotas.length;
  if (expiredCount >= 4) {
    socio.subscriptionStatus = 'EXPIRED';
  } else if (expiredCount > 0) {
    socio.subscriptionStatus = 'EXPIRES_SOON';
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
  getAllSociosSimpleFiltered,
  getAllSimpleSocios,
  getNewSocioId,
  newSocio,
  getOneSocio,
  updateSocio,
  deceasedSocio,
  deleteSocio,
  markQuotaAsPaid,
  markExtraFeeAsPaid,
  markQuotaAsUnpaid,
  markExtraFeeAsUnpaid,
  addQuotaManually,
  deleteQuota
};
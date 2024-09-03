const mongoose = require("mongoose");
const moment = require('moment');
const { getMonthNumber } = require("../helpers/getMonthNumber");

const quotaSchema = new mongoose.Schema(
  {
    month: {
      type: String,
      enum: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    datePayed: {
      type: Date,
      default: null,
    },
    quotaStatus:{
      type: String,
      enum: ['PAID', 'EXPIRED', 'PENDING'],
      default: 'PENDING'
    },
  },
  { _id: false }
);

const socioSchema = new mongoose.Schema(
  {
    subscriptionStatus:{
      type: String,
      enum: ['ACTIVE', 'EXPIRES_SOON', 'EXPIRED', 'DECEASED'],
      default: 'ACTIVE',
      required: [true, "subscriptionStatus is required."],
    },
    idSocio: {
      type: Number,
      required: [true, "idSocio is required."],
      unique: true,
    },
    name: {
      type: String,
      required: [true, "name is required."],
    },
    surname: {
      type: String,
      required: [true, "surname is required."],
    },
    dni: {
      type: String,
      required: [true, "dni is required."],
    },
    cuil: {
      type: String,
      required: [true, "cuil is required."],
    },
    maritalStatus:{
      type: String,
      enum: ['','Soltero', 'Casado', 'Viudo', 'Divorciado'],
      default: '',
    },
    birthdate: {
      type: String,
      default: '',
    },
    startDate: {
      type: String,
      required: [true, "startDate is required."],
    },
    fee: {
      type: String,
      required: [true, "fee is required."],
    },
    email: {
      type: String,
      default: '',
    },
    phonenumber: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    apartmentNumber: {
      type: String,
      default: '',
    },
    postalCode: {
      type: String,
      default: '',
    },
    town: {
      type: String,
      default: '',
    },
    quotas: [quotaSchema],
    alive:{
      type: Boolean,
      default: true,
    },
    status:{
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true
  }
);

socioSchema.methods.toJSON = function () {
  const { __v, _id, quotas, ...socio } = this.toObject();
  const parseSocio = {
    quotas: quotas.reverse(),
    id: _id,
    ...socio,
  };
  return parseSocio;
};

socioSchema.methods.simple = function () {
  const paidQuotas = this.quotas.filter(quota => quota.quotaStatus === 'PAID');
  const lastQuota = paidQuotas.reduce((latest, current) => {
    const latestDate = new Date(latest.year, getMonthNumber(latest.month));
    const currentDate = new Date(current.year, getMonthNumber(current.month));
    return currentDate > latestDate ? current : latest;
  }, paidQuotas[0]);

  let antiquity;
  const years = moment().diff(moment(this.startDate, 'YYYY-MM-DD'), 'years');
  const months  = moment().diff(moment(this.startDate, 'YYYY-MM-DD'), 'months');
  const days = moment().diff(moment(this.startDate, 'YYYY-MM-DD'), 'days');

  if (years >= 1) {
    antiquity = `${years} ${years === 1 ? 'año' : 'años'}`;
  } else if(months >= 1){
    antiquity = `${months} ${months === 1 ? 'mes' : 'meses'}`;
  } else if(days >= 0){
    antiquity = `${days >= 1 ? days : 1} ${days < 2 ? 'día' : 'días'}`;
  }

  return {
    subscriptionStatus: this.subscriptionStatus,
    idSocio: this.idSocio,
    name: this.name,
    surname: this.surname,
    cuil: this.cuil,
    phonenumber: this.phonenumber,
    address: this.address,
    town: this.town,
    antiquity,
    lastQuota: lastQuota || null,
  };
};

const Socio = mongoose.model("Socio", socioSchema);

module.exports = Socio;
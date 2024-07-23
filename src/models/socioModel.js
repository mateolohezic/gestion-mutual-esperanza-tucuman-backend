const mongoose = require("mongoose");

const socioSchema = new mongoose.Schema(
  {
    subscriptionStatus:{
      type: String,
      enum: ['ACTIVE', 'EXPIRE_SOON', 'EXPIRED', 'DECEASED'],
      required: [true, "La propiedad subscriptionStatus es obligatoria"],
    },
    idSocio: {
      type: Number,
      required: [true, "La propiedad idSocio es obligatoria"],
      unique: true,
    },
    name: {
      type: String,
      required: [true, "La propiedad name es obligatoria"],
    },
    surname: {
      type: String,
      required: [true, "La propiedad surname es obligatoria"],
    },
    dni: {
      type: String,
      required: [true, "La propiedad dni es obligatoria"],
    },
    cuil: {
      type: String,
      required: [true, "La propiedad cuil es obligatoria"],
    },
    maritalStatus:{
      type: String,
      enum: ['','Soltero', 'Casado', 'Viudo', 'Divorciado'],
      required: [true, "La propiedad maritalStatus es obligatoria"],
    },
    birthdate: {
      type: String,
      required: [true, "La propiedad birthdate es obligatoria"],
    },
    startDate: {
      type: String,
      required: [true, "La propiedad startDate es obligatoria"],
    },
    fee: {
      type: String,
      required: [true, "La propiedad fee es obligatoria"],
    },
    email: {
      type: String,
      required: [true, "La propiedad email es obligatoria"],
    },
    phonenumber: {
      type: String,
      required: [true, "La propiedad phonenumber es obligatoria"],
    },
    address: {
      type: String,
      required: [true, "La propiedad address es obligatoria"],
    },
    apartmentNumber: {
      type: String,
      required: [true, "La propiedad apartmentNumber es obligatoria"],
    },
    postalCode: {
      type: String,
      required: [true, "La propiedad postalCode es obligatoria"],
    },
    town: {
      type: String,
      required: [true, "La propiedad town es obligatoria"],
    },
  }
,{ suppressReservedKeysWarning: true });

socioSchema.methods.toJSON = function () {
  const { __v, _id, ...product } = this.toObject();
  const parseProduct = {
    id: _id,
    ...product,
  };
  return parseProduct;
};

socioSchema.methods.simple = function () {
  return {
    subscriptionStatus: this.subscriptionStatus,
    idSocio: this.idSocio,
    name: this.name,
    surname: this.surname,
    cuil: this.cuil,
    startDate: this.startDate,
    phonenumber: this.phonenumber,
    address: this.address,
    town: this.town
  };
};

const Socio = mongoose.model("Socio", socioSchema);

module.exports = Socio;
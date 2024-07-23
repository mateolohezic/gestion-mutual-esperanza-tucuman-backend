const Socio = require("../models/socioModel");
const socioService = require("../services/socioService");

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
    const socios = await socioService.getAllProducts();
    const simpleSocios = socios.map( socio => {
      return socio.simple()
    })
    return res.status(200).json({socios:simpleSocios});
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// const findSimpleSocio = async (req, res) => {
//   try {
//     const { search } = req.params;
//     const socios = await socioService.getAllProducts();
//     const filterSocios = socios.filter( product => (
//       product.name.toLowerCase().includes(search.toLowerCase()) ||
//       product.collection.toLowerCase().includes(search.toLowerCase()) ||
//       product.year === search
//     ))
//     const languageProducts = filterProducts.map( product => {
//       // if(language === 'es') return product.simpleES()
//       // if(language === 'en') return product.simpleEN()
//       return product.EU()
//     })

//     res.status(200).json(languageProducts);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

const newSocio = async (req, res) => {
  try {
    const { name, surname, dni, cuil, maritalStatus, birthdate, idSocio, fee, startDate, email, phonenumber, address, apartmentNumber, postalCode, town } = req.body;
    const subscriptionStatus = 'ACTIVE'
    const socio = await Socio.create({ subscriptionStatus, name, surname, dni, cuil, maritalStatus, birthdate, idSocio, fee, startDate, email, phonenumber, address, apartmentNumber, postalCode, town });
    res.status(201).json({socio});
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const getOneSocio = async (req, res) => {
  try {
    const { idSocio } = req.params;

    const socio = await Socio.findOne({idSocio});

    if (!socio) {
      return res.status(404).json({ error: "Socio no encontrado." });
    }

    res.status(200).json(socio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
 
const updateSocio = async (req, res) => {
  try {
    const { id, name, surname, dni, cuil, maritalStatus, birthdate, fee, startDate, email, phonenumber, address, apartmentNumber, postalCode, town } = req.body;

    const socio = await Socio.findByIdAndUpdate(
      id,
      { name, surname, dni, cuil, maritalStatus, birthdate, fee, startDate, email, phonenumber, address, apartmentNumber, postalCode, town },
      { new: true }
    );

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
    const id = req.body;
    const socio = await Socio.findByIdAndUpdate(id, { status: false });
    if (!socio) {
      return res.status(404).json({ message: "Socio no encontrado." });
    }
    return res.status(200).json({ message: "Socio eliminado con éxito." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllSocios,
  getAllSimpleSocios,
  // findSimpleSocio,
  newSocio,
  getOneSocio,
  updateSocio,
  deleteSocio,
};
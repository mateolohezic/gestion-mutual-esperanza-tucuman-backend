const express = require("express");

const router = express.Router();

// const { validarJWT } = require("../middlewares/validar-jwt");
// const { esAdminRol } = require("../middlewares/validar-roles");
const socioController = require("../controllers/socioController");

router.get("/", socioController.getAllSocios);

router.get("/simple", socioController.getAllSimpleSocios);

// router.get("/search/:search", socioController.findSimpleProducts);

router.post("/", socioController.newSocio);

router.get("/:idSocio", socioController.getOneSocio);

router.put("/:id", socioController.updateSocio);
// router.put("/:id", [validarJWT, esAdminRol], socioController.updateSocio);

router.delete("/:id", socioController.deleteSocio);

module.exports = router;

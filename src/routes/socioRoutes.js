const express = require("express");

const router = express.Router();

const { validarJWT } = require("../middlewares/validar-jwt");
// const { esAdminRol } = require("../middlewares/validar-roles");
const socioController = require("../controllers/socioController");

router.get("/", validarJWT, socioController.getAllSocios);
// router.get("/simple", socioController.getAllSimpleSocios);
router.get("/simple", validarJWT, socioController.getAllSociosSimpleFiltered);
router.get("/new-id", validarJWT, socioController.getNewSocioId);
router.get("/:idSocio", validarJWT, socioController.getOneSocio);

// router.get("/search/:search", socioController.findSimpleProducts);

router.put("/", validarJWT, socioController.updateSocio);
router.put("/deceased", validarJWT, socioController.deceasedSocio);

router.post("/", validarJWT, socioController.newSocio);
router.post("/quota/pay", validarJWT, socioController.markQuotaAsPaid);
router.post("/quota/extra/pay", validarJWT, socioController.markExtraFeeAsPaid);
router.post("/quota/unpay", validarJWT, socioController.markQuotaAsUnpaid);
router.post("/quota/extra/unpay", validarJWT, socioController.markExtraFeeAsUnpaid);
router.post("/quota", validarJWT, socioController.addQuotaManually);

// router.put("/:id", [validarJWT, esAdminRol], socioController.updateSocio);

router.delete("/quota", validarJWT, socioController.deleteQuota);
router.delete("/:id", validarJWT, socioController.deleteSocio);


module.exports = router;

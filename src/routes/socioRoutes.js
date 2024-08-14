const express = require("express");

const router = express.Router();

// const { validarJWT } = require("../middlewares/validar-jwt");
// const { esAdminRol } = require("../middlewares/validar-roles");
const socioController = require("../controllers/socioController");

router.get("/", socioController.getAllSocios);
router.get("/simple", socioController.getAllSimpleSocios);
router.get("/new-id", socioController.getNewSocioId);
router.get("/:idSocio", socioController.getOneSocio);

// router.get("/search/:search", socioController.findSimpleProducts);

router.put("/", socioController.updateSocio);
router.put("/deceased", socioController.deceasedSocio);

router.post("/", socioController.newSocio);
router.post("/quota/pay", socioController.markQuotaAsPaid);
router.post("/quota/unpay", socioController.markQuotaAsUnpaid);
router.post("/quota", socioController.addQuotaManually);

// router.put("/:id", [validarJWT, esAdminRol], socioController.updateSocio);

router.delete("/quota", socioController.deleteQuota);
router.delete("/:id", socioController.deleteSocio);


module.exports = router;

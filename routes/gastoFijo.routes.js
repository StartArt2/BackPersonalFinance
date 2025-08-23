const express = require("express");
const router = express.Router();
const gastoFijoController = require("../controllers/gastoFijo.controller");

// Definir rutas
router.post("/", gastoFijoController.createGastoFijo);
router.get("/", gastoFijoController.getGastosFijos);
router.get("/:id", gastoFijoController.getGastoFijoById);
router.put("/:id", gastoFijoController.updateGastoFijo);
router.delete("/:id", gastoFijoController.deleteGastoFijo);

module.exports = router;

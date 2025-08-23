const express = require("express");
const router = express.Router();
const cajaController = require("../controllers/caja.controller");

// Definir rutas
router.get("/", cajaController.getCajas);
router.post("/", cajaController.createOrUpdateCaja);

module.exports = router;

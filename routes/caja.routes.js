const express = require("express");
const router = express.Router();
const cajaController = require("../controllers/caja.controller");

// Definir rutas
router.get("/", cajaController.getCajas);
router.post("/", cajaController.createOrUpdateCaja);
router.get("/detalle/:fecha", cajaController.getCajaByDate);

module.exports = router;

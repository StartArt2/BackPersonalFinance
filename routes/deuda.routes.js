const express = require("express");
const router = express.Router();
const deudaController = require("../controllers/deuda.controller");

// Definir rutas
router.get("/", deudaController.getDeudas);
router.post("/", deudaController.createDeuda);
router.get("/:id", deudaController.getDeudaById);
router.put("/:id", deudaController.updateDeuda);
router.delete("/:id", deudaController.deleteDeuda);

module.exports = router;
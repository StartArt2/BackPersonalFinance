const express = require("express");
const router = express.Router();
const abonoController = require("../controllers/abono.controller");

// Definir las rutas y asociarlas a los controladores
router.post("/", abonoController.createAbono);
router.get("/", abonoController.getAbonos);
router.get("/:id", abonoController.getAbonoById);
router.put("/:id", abonoController.updateAbono);
router.delete("/:id", abonoController.deleteAbono);

module.exports = router;

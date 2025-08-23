const express = require("express");
const router = express.Router();
const {
  createGastoVariable,
  getGastoVariables,
  getGastoVariableById,
  updateGastoVariable,
  deleteGastoVariable
} = require("../controllers/gastoVariable.controller");

// Rutas
router.post("/", createGastoVariable);
router.get("/", getGastoVariables);
router.get("/:id", getGastoVariableById);
router.put("/:id", updateGastoVariable);
router.delete("/:id", deleteGastoVariable);

module.exports = router;

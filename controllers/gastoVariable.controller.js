const GastoVariable = require("../models/gastoVariable.model");
const { parseLocalStartOfDayFromYYYYMMDD } = require("../utils/dateUtils");
const { recalculateCajaForDate } = require("../services/cajaService");

// Crear
const createGastoVariable = async (req, res) => {
  try {
    const rawFecha = req.body.fecha;
    if (!rawFecha) return res.status(400).json({ error: "fecha requerida" });
    const fechaLocal = parseLocalStartOfDayFromYYYYMMDD(rawFecha);
    if (!fechaLocal) return res.status(400).json({ error: "fecha inválida" });

    const item = new GastoVariable({
      ...req.body,
      fecha: fechaLocal
    });
    await item.save();

    await recalculateCajaForDate(fechaLocal);
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Actualizar -> recalcular caja antigua y nueva fecha si cambia
const updateGastoVariable = async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await GastoVariable.findById(id);
    if (!existing) return res.status(404).json({ error: "No encontrado" });

    const oldDate = existing.fecha ? new Date(existing.fecha) : null;

    // si viene fecha en el body la normalizamos
    let fechaLocal = existing.fecha;
    if (req.body.fecha) {
      const parsed = parseLocalStartOfDayFromYYYYMMDD(req.body.fecha);
      if (!parsed) return res.status(400).json({ error: "fecha inválida" });
      fechaLocal = parsed;
      req.body.fecha = fechaLocal;
    }

    const item = await GastoVariable.findByIdAndUpdate(id, req.body, { new: true });
    // recalcular caja para la fecha antigua y la nueva (si cambió)
    if (oldDate) await recalculateCajaForDate(oldDate);
    if (fechaLocal) await recalculateCajaForDate(fechaLocal);

    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Eliminar -> recalcular caja del día
const deleteGastoVariable = async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await GastoVariable.findById(id);
    if (!existing) return res.status(404).json({ error: "No encontrado" });

    const fecha = existing.fecha;
    await GastoVariable.findByIdAndDelete(id);
    if (fecha) await recalculateCajaForDate(fecha);
    res.json({ message: "Eliminado con éxito" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Listar todos
const getGastoVariables = async (req, res) => {
  try {
    const items = await GastoVariable.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener uno
const getGastoVariableById = async (req, res) => {
  try {
    const item = await GastoVariable.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "No encontrado" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createGastoVariable,
  getGastoVariables,
  getGastoVariableById,
  updateGastoVariable,
  deleteGastoVariable
};

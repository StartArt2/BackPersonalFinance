// controllers/gastoFijo.controller.js
const GastoFijo = require("../models/gastoFijo.model");
const { recalculateCajaForDate } = require("../services/cajaService");

// Intentamos importar las posibles funciones del utils (nombres que hemos usado)
let { parseLocalStartOfDayFromYYYYMMDD, parseLocalDateFromYYYYMMDD } = require("../utils/dateUtils");

// fallback: si ninguna existe, definimos una función segura equivalente
const parseLocalDate = parseLocalStartOfDayFromYYYYMMDD || parseLocalDateFromYYYYMMDD || function (dateLike) {
  if (!dateLike) return null;
  // si ya es Date
  if (dateLike instanceof Date) {
    return new Date(dateLike.getFullYear(), dateLike.getMonth(), dateLike.getDate());
  }
  // si viene string "YYYY-MM-DD" o "YYYY-MM-DDTHH:MM:SS..."
  const base = String(dateLike).split("T")[0];
  const parts = base.split("-");
  if (parts.length !== 3) return null;
  const y = Number(parts[0]), m = Number(parts[1]) - 1, d = Number(parts[2]);
  if ([y,m,d].some(n => Number.isNaN(n))) return null;
  return new Date(y, m, d); // 00:00 local
};

//
// Create
//
exports.createGastoFijo = async (req, res) => {
  try {
    const { fecha, valor, detalle, destino } = req.body;
    if (!fecha || valor == null || !detalle) {
      return res.status(400).json({ error: "fecha, valor y detalle son requeridos" });
    }

    const fechaLocal = parseLocalDate(fecha);
    if (!fechaLocal) return res.status(400).json({ error: "Formato de fecha inválido (YYYY-MM-DD)" });

    const item = new GastoFijo({
      fecha: fechaLocal,
      valor,
      detalle,
      destino,
    });
    await item.save();

    // Recalcular la caja para la fecha del gasto (si tienes el servicio)
    try { await recalculateCajaForDate(fechaLocal); } catch (e) { console.error("recalc caja createGastoFijo:", e); }

    return res.status(201).json(item);
  } catch (err) {
    console.error("Error createGastoFijo:", err);
    return res.status(400).json({ error: err.message });
  }
};

//
// Listar todos
//
exports.getGastosFijos = async (req, res) => {
  try {
    const items = await GastoFijo.find();
    return res.json(items);
  } catch (err) {
    console.error("Error getGastosFijos:", err);
    return res.status(500).json({ error: err.message });
  }
};

//
// Obtener uno
//
exports.getGastoFijoById = async (req, res) => {
  try {
    const item = await GastoFijo.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "No encontrado" });
    return res.json(item);
  } catch (err) {
    console.error("Error getGastoFijoById:", err);
    return res.status(500).json({ error: err.message });
  }
};

//
// Actualizar (recalcula cajas antiguas y nuevas si cambia fecha)
//
exports.updateGastoFijo = async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await GastoFijo.findById(id);
    if (!existing) return res.status(404).json({ error: "No encontrado" });

    const oldDate = existing.fecha ? new Date(existing.fecha) : null;

    // Si viene fecha en body, la normalizamos
    if (req.body.fecha) {
      const parsed = parseLocalDate(req.body.fecha);
      if (!parsed) return res.status(400).json({ error: "Formato de fecha inválido (YYYY-MM-DD)" });
      req.body.fecha = parsed;
    }

    // actualizar
    const item = await GastoFijo.findByIdAndUpdate(id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: "No encontrado" });

    // Recalcular caja para la fecha antigua y la nueva (si aplica)
    try {
      if (oldDate) await recalculateCajaForDate(oldDate);
      if (item.fecha) await recalculateCajaForDate(item.fecha);
    } catch (e) {
      console.error("recalc caja updateGastoFijo:", e);
    }

    return res.json(item);
  } catch (err) {
    console.error("Error updateGastoFijo:", err);
    return res.status(400).json({ error: err.message });
  }
};

//
// Eliminar (recalcula caja del día eliminado)
//
exports.deleteGastoFijo = async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await GastoFijo.findById(id);
    if (!existing) return res.status(404).json({ error: "No encontrado" });

    const fecha = existing.fecha ? new Date(existing.fecha) : null;
    await GastoFijo.findByIdAndDelete(id);

    try {
      if (fecha) await recalculateCajaForDate(fecha);
    } catch (e) {
      console.error("recalc caja deleteGastoFijo:", e);
    }

    return res.json({ message: "Eliminado con éxito" });
  } catch (err) {
    console.error("Error deleteGastoFijo:", err);
    return res.status(500).json({ error: err.message });
  }
};

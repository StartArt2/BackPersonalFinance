// controllers/caja.controller.js
const Caja = require("../models/caja.model");
const GastoFijo = require("../models/gastoFijo.model");
const GastoVariable = require("../models/gastoVariable.model");
const Compra = require("../models/compra.model");
const Deuda = require("../models/deuda.model");
const { toLocalStartOfDay, toLocalEndOfDay } = require("../utils/dateUtils");

async function getCajas(req, res) {
  try {
    const cajas = await Caja.find()
      .populate("gastos_fijos gastos_variables compras deudas");
    return res.json(cajas);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function createOrUpdateCaja(req, res) {
  try {
    const { fecha, ingresos_dia } = req.body;

    if (!fecha || ingresos_dia == null) {
      return res.status(400).json({ error: "Fecha e ingresos_dia son requeridos" });
    }

    // normalizar la fecha (parseando como local, usando T00:00:00)
    const start = toLocalStartOfDay(fecha);

    start.setHours(0, 0, 0, 0);
    const end = toLocalEndOfDay(fecha);

    end.setHours(23, 59, 59, 999);

    // buscar gastos del día
    const [gastosFijos, gastosVariables, compras, deudas] = await Promise.all([
      GastoFijo.find({ fecha: { $gte: start, $lte: end } }),
      GastoVariable.find({ fecha: { $gte: start, $lte: end } }),
      Compra.find({ fecha: { $gte: start, $lte: end } }),
      Deuda.find({ fecha: { $gte: start, $lte: end } }) // si Deuda guarda fecha, si no se puede omitir
    ]);

    const total_gastos_dia =
      [...gastosFijos, ...gastosVariables, ...compras, ...deudas].reduce(
        (sum, g) => sum + (g.valor || 0),
        0
      );

    const saldo_dia = ingresos_dia - total_gastos_dia;

    const caja = await Caja.findOneAndUpdate(
      { fecha: start },
      {
        fecha: start,
        ingresos_dia,
        total_gastos_dia,
        saldo_dia,
        gastos_fijos: gastosFijos.map(g => g._id),
        gastos_variables: gastosVariables.map(g => g._id),
        compras: compras.map(g => g._id),
        deudas: deudas.map(g => g._id)
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate("gastos_fijos gastos_variables compras deudas");

    return res.json(caja);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getCajas,
  createOrUpdateCaja
};

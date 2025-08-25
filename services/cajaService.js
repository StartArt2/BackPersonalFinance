// services/cajaService.js
const Caja = require("../models/caja.model");
const GastoFijo = require("../models/gastoFijo.model");
const GastoVariable = require("../models/gastoVariable.model");
const Compra = require("../models/compra.model");
const { startOfDay, endOfDay } = require("../utils/dateUtils");

async function recalculateCajaForDate(dateLike) {
  // dateLike puede ser "YYYY-MM-DD" o Date ya normalizada
  const start = startOfDay(new Date(dateLike));
  const end = endOfDay(start);

  // buscar gastos del día (si tu Deuda no tiene fecha, no la incluyas)
  const [gastosFijos, gastosVariables, compras] = await Promise.all([
    GastoFijo.find({ fecha: { $gte: start, $lte: end } }),
    GastoVariable.find({ fecha: { $gte: start, $lte: end } }),
    Compra.find({ fecha: { $gte: start, $lte: end } })
  ]);

  const total_gastos_dia = [...gastosFijos, ...gastosVariables, ...compras].reduce(
    (sum, g) => sum + (g.valor || 0),
    0
  );

  // Busca si hay caja para ese día
  let caja = await Caja.findOne({ fecha: { $gte: start, $lte: end } });

  if (!caja) {
    // crear caja con ingresos_dia por defecto 0
    caja = new Caja({
      fecha: start,
      ingresos_dia: 0,
      total_gastos_dia,
      saldo_dia: 0 - total_gastos_dia,
      gastos_fijos: gastosFijos.map(g => g._id),
      gastos_variables: gastosVariables.map(g => g._id),
      compras: compras.map(g => g._id)
    });
    await caja.save();
    return caja;
  }

  // actualizar campos
  caja.total_gastos_dia = total_gastos_dia;
  caja.gastos_fijos = gastosFijos.map(g => g._id);
  caja.gastos_variables = gastosVariables.map(g => g._id);
  caja.compras = compras.map(g => g._id);
  caja.saldo_dia = (caja.ingresos_dia || 0) - total_gastos_dia;
  await caja.save();
  return caja;
}

module.exports = { recalculateCajaForDate };

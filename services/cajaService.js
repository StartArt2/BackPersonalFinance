// services/cajaService.js
const Caja = require("../models/caja.model");
const GastoFijo = require("../models/gastoFijo.model");
const GastoVariable = require("../models/gastoVariable.model");
const Compra = require("../models/compra.model");

// Normaliza la fecha al inicio del día
function startOfDay(dateLike) {
  const d = new Date(dateLike);
  if (isNaN(d)) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

// Normaliza la fecha al final del día
function endOfDay(dateLike) {
  const d = new Date(dateLike);
  if (isNaN(d)) return null;
  d.setHours(23, 59, 59, 999);
  return d;
}

async function recalculateCajaForDate(dateLike) {
  // Trae la única caja existente
  let caja = await Caja.findOne();
  if (!caja) {
    // Crear la caja única si no existe
    caja = new Caja({
      nombre: "Caja Principal",
      ingresos_dia: 0,
      total_gastos_dia: 0,
      saldo_dia: 0,
      total_acumulado: 0,
      gastos_fijos: [],
      gastos_variables: [],
      compras: [],
    });
  }

  // Traer todos los gastos y compras
  const [gastosFijos, gastosVariables, compras] = await Promise.all([
    GastoFijo.find(),
    GastoVariable.find(),
    Compra.find(),
  ]);

  // Calcular totales
  const total_gastos = [...gastosFijos, ...gastosVariables, ...compras].reduce(
    (sum, item) => sum + (item.valor || 0),
    0
  );

  caja.total_gastos_dia = total_gastos;
  caja.saldo_dia = (caja.ingresos_dia || 0) - total_gastos;
  caja.gastos_fijos = gastosFijos.map(g => g._id);
  caja.gastos_variables = gastosVariables.map(g => g._id);
  caja.compras = compras.map(c => c._id);

  await caja.save();
  console.log("[CajaService] Caja recalculada:", caja);

  return caja;
}

async function recalculateCajaTotals(cajaId) {
  const caja = await Caja.findById(cajaId);
  if (!caja) return null;

  const totalIngresos = (caja.ingresos || []).reduce((acc, i) => acc + (i.valor || 0), 0);
  caja.total_acumulado = totalIngresos;

  await caja.save();
  return caja;
}

module.exports = { recalculateCajaForDate, recalculateCajaTotals };

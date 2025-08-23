const express = require("express");
const router = express.Router();
const Caja = require("../models/caja.model");

// Cuando obtenemos caja, traemos todas las referencias
router.get("/", async (req, res) => {
  try {
    const cajas = await Caja.find()
      .populate("gastos_fijos gastos_variables compras deudas");
    res.json(cajas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear/Actualizar caja de un día con cálculo automático
router.post("/", async (req, res) => {
  try {
    const { fecha, ingresos_dia } = req.body;

    if (!fecha || ingresos_dia == null) {
      return res.status(400).json({ error: "Fecha e ingresos_dia son requeridos" });
    }

    // Normalizar la fecha (ignorar horas)
    const start = new Date(fecha);
    start.setHours(0, 0, 0, 0);
    const end = new Date(fecha);
    end.setHours(23, 59, 59, 999);

    // Buscar todos los gastos de ese día
    const [gastosFijos, gastosVariables, compras, deudas] = await Promise.all([
      GastoFijo.find({ fecha: { $gte: start, $lte: end } }),
      GastoVariable.find({ fecha: { $gte: start, $lte: end } }),
      Compra.find({ fecha: { $gte: start, $lte: end } }),
      Deuda.find({ fecha: { $gte: start, $lte: end } })
    ]);

    // Calcular el total de gastos
    const total_gastos_dia =
      [...gastosFijos, ...gastosVariables, ...compras, ...deudas].reduce(
        (sum, g) => sum + (g.valor || 0),
        0
      );

    // Calcular saldo
    const saldo_dia = ingresos_dia - total_gastos_dia;

    // Crear o actualizar caja
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
      { upsert: true, new: true }
    ).populate("gastos_fijos gastos_variables compras deudas");

    res.json(caja);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
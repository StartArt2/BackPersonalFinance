const mongoose = require("mongoose");

const IngresoSchema = new mongoose.Schema({
  fecha: { type: Date, required: true }, // fecha y hora del ingreso
  valor: { type: Number, required: true },
  detalle: { type: String, default: "" },
  origen: { type: String, default: "" } // opcional: caja, venta, transferencia, etc.
}, { _id: true, timestamps: true });

const cajachema = new mongoose.Schema({
  // Si quieres una sola caja, puedes dejar _id fijo o crear un único doc
  nombre: { type: String, default: "Caja Principal" },
  total_acumulado: { type: Number, default: 0 },
  ingresos: [IngresoSchema],
  // mantén gastos/compras/deudas por separado en sus colecciones
}, { timestamps: true });

module.exports = mongoose.model("Caja", cajachema);

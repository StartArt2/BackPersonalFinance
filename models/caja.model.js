const mongoose = require("mongoose");

const CajaSchema = new mongoose.Schema({
  fecha: { type: Date, required: true, unique: true },
  ingresos_dia: { type: Number, default: 0 },
  total_gastos_dia: { type: Number, default: 0 },
  saldo_dia: { type: Number, default: 0 },

  gastos_fijos: [{ type: mongoose.Schema.Types.ObjectId, ref: "GastoFijo" }],
  gastos_variables: [{ type: mongoose.Schema.Types.ObjectId, ref: "GastoVariable" }],
  compras: [{ type: mongoose.Schema.Types.ObjectId, ref: "Compra" }],
  deudas: [{ type: mongoose.Schema.Types.ObjectId, ref: "Deuda" }]
});

module.exports = mongoose.model("Caja", CajaSchema);


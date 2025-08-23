const mongoose = require("mongoose");

const DeudaSchema = new mongoose.Schema({
  detalle: { type: String, required: true },
  destino: { type: String, required: true },
  monto_total: { type: Number, required: true },
  saldo_actual: { type: Number, required: true },
  fecha_inicio: { type: Date, default: Date.now },

  abonos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Abono" }]
});

module.exports = mongoose.model("Deuda", DeudaSchema);

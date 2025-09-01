const mongoose = require("mongoose");

const DeudaSchema = new mongoose.Schema({
  detalle: { type: String, required: true },
  destino: { type: String, required: true },
  monto_total: { type: Number, required: true },
  saldo_actual: { type: Number, required: true },
  fecha_inicio: { type: Date, default: Date.now },

  // 🔹 NUEVOS CAMPOS para préstamos
  tipo_prestamo: { type: String, enum: ["simple", "frances"], default: "simple" }, // simple o sistema francés
  porcentaje_interes: { type: Number, default: 0 }, // % anual
  plazo_meses: { type: Number, default: 0 }, // meses de duración
  capital_inicial: { type: Number, default: 0 }, // monto al inicio

  abonos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Abono" }]
});

module.exports = mongoose.model("Deuda", DeudaSchema);

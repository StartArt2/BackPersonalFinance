const mongoose = require("mongoose");

const AbonoSchema = new mongoose.Schema({
  deuda_id: { type: mongoose.Schema.Types.ObjectId, ref: "Deuda", required: true },
  fecha: { type: Date, required: true },
  valor: { type: Number, required: true },
  detalle: { type: String },

  // 🔹 NUEVOS CAMPOS
  tipo_abono: { type: String, enum: ["manual", "porcentaje", "cuota"], default: "manual" },
  porcentaje_aplicado: { type: Number, default: 0 } // si se pagó X% del saldo
});

module.exports = mongoose.model("Abono", AbonoSchema);

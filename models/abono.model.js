const mongoose = require("mongoose");

const AbonoSchema = new mongoose.Schema({
  deuda_id: { type: mongoose.Schema.Types.ObjectId, ref: "Deuda", required: true },
  fecha: { type: Date, required: true },
  valor: { type: Number, required: true },
  detalle: { type: String }
});

module.exports = mongoose.model("Abono", AbonoSchema);

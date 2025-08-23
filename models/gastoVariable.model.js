const mongoose = require("mongoose");

const GastoVariableSchema = new mongoose.Schema({
  fecha: { type: Date, required: true },
  valor: { type: Number, required: true },
  detalle: { type: String, required: true },
  destino: { type: String }
});

module.exports = mongoose.model("GastoVariable", GastoVariableSchema);
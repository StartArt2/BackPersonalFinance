const Deuda = require("../models/deuda.model");

// Listar todas las deudas (con abonos)
exports.getDeudas = async (req, res) => {
  try {
    const deudas = await Deuda.find().populate("abonos");
    res.json(deudas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear una deuda
exports.createDeuda = async (req, res) => {
  try {
    const data = req.body;

    // capital inicial = monto_total al inicio
    if (!data.capital_inicial) {
      data.capital_inicial = data.monto_total;
    }

    const item = new Deuda(data);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Obtener una deuda por ID
exports.getDeudaById = async (req, res) => {
  try {
    const item = await Deuda.findById(req.params.id).populate("abonos");
    if (!item) return res.status(404).json({ error: "No encontrado" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar deuda
exports.updateDeuda = async (req, res) => {
  try {
    const item = await Deuda.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: "No encontrado" });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar deuda
exports.deleteDeuda = async (req, res) => {
  try {
    const item = await Deuda.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "No encontrado" });
    res.json({ message: "Eliminado con éxito" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

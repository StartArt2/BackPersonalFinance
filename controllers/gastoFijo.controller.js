const GastoFijo = require("../models/gastoFijo.model");

// Crear
exports.createGastoFijo = async (req, res) => {
  try {
    const item = new GastoFijo(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Listar todos
exports.getGastosFijos = async (req, res) => {
  try {
    const items = await GastoFijo.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener uno
exports.getGastoFijoById = async (req, res) => {
  try {
    const item = await GastoFijo.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "No encontrado" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar
exports.updateGastoFijo = async (req, res) => {
  try {
    const item = await GastoFijo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: "No encontrado" });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar
exports.deleteGastoFijo = async (req, res) => {
  try {
    const item = await GastoFijo.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "No encontrado" });
    res.json({ message: "Eliminado con éxito" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

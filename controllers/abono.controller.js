const Abono = require("../models/abono.model");

// Crear
exports.createAbono = async (req, res) => {
  try {
    const item = new Abono(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Listar todos
exports.getAbonos = async (req, res) => {
  try {
    const items = await Abono.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener uno
exports.getAbonoById = async (req, res) => {
  try {
    const item = await Abono.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "No encontrado" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar
exports.updateAbono = async (req, res) => {
  try {
    const item = await Abono.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: "No encontrado" });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar
exports.deleteAbono = async (req, res) => {
  try {
    const item = await Abono.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "No encontrado" });
    res.json({ message: "Eliminado con éxito" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

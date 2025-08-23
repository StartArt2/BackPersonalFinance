const Compra = require("../models/compra.model");

// Crear
exports.createCompra = async (req, res) => {
  try {
    const item = new Compra(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Listar todos
exports.getCompras = async (req, res) => {
  try {
    const items = await Compra.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener uno
exports.getCompraById = async (req, res) => {
  try {
    const item = await Compra.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "No encontrado" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar
exports.updateCompra = async (req, res) => {
  try {
    const item = await Compra.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: "No encontrado" });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar
exports.deleteCompra = async (req, res) => {
  try {
    const item = await Compra.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "No encontrado" });
    res.json({ message: "Eliminado con éxito" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

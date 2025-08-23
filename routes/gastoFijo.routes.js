const express = require("express");
const router = express.Router();
const gastoFijo = require("../models/gastoFijo.model"); // Cambia al modelo correcto

// Crear
router.post("/", async (req, res) => {
  try {
    const item = new gastoFijo(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Listar todos
router.get("/", async (req, res) => {
  try {
    const items = await gastoFijo.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener uno
router.get("/:id", async (req, res) => {
  try {
    const item = await gastoFijo.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "No encontrado" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar
router.put("/:id", async (req, res) => {
  try {
    const item = await gastoFijo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: "No encontrado" });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar
router.delete("/:id", async (req, res) => {
  try {
    const item = await gastoFijo.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "No encontrado" });
    res.json({ message: "Eliminado con éxito" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const Deuda = require("../models/deuda.model");

// Extra: cuando listamos deudas, traemos también los abonos
router.get("/", async (req, res) => {
  try {
    const deudas = await Deuda.find().populate("abonos");
    res.json(deudas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Crear
router.post("/", async (req, res) => {
  try {
    const item = new Deuda(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obtener uno
router.get("/:id", async (req, res) => {
  try {
    const item = await Deuda.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "No encontrado" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar
router.put("/:id", async (req, res) => {
  try {
    const item = await Deuda.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: "No encontrado" });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar
router.delete("/:id", async (req, res) => {
  try {
    const item = await Deuda.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "No encontrado" });
    res.json({ message: "Eliminado con éxito" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
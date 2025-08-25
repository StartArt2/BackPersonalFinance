const Compra = require("../models/compra.model");
const { recalculateCajaForDate } = require("../services/cajaService");
const { parseLocalStartOfDayFromYYYYMMDD } = require("../utils/dateUtils");

// Crear
exports.createCompra = async (req, res) => {
  try {
    let { fecha, valor, detalle, destino } = req.body;

    if (!fecha || valor == null || !detalle) {
      return res.status(400).json({ error: "fecha, valor y detalle son requeridos" });
    }

    // Normalizar fecha al inicio del día local
    const fechaLocal = parseLocalStartOfDayFromYYYYMMDD(fecha);
    if (!fechaLocal) {
      return res.status(400).json({ error: "Formato de fecha inválido (YYYY-MM-DD)" });
    }

    const item = new Compra({
      fecha: fechaLocal,
      valor,
      detalle,
      destino,
    });

    await item.save();

    console.log("Compra creada:", item);

    // Recalcular caja para esa fecha
    const caja = await recalculateCajaForDate(fechaLocal);

    console.log("Caja recalculada:", caja);

    res.status(201).json({ compra: item, caja });
  } catch (err) {
    console.error("Error en createCompra:", err);
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
    if (req.body.fecha) {
      req.body.fecha = parseLocalStartOfDayFromYYYYMMDD(req.body.fecha);
    }

    const item = await Compra.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: "No encontrado" });

    // Recalcular caja para la fecha actualizada
    await recalculateCajaForDate(item.fecha);

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

    // Recalcular caja para la fecha de la compra eliminada
    await recalculateCajaForDate(item.fecha);

    res.json({ message: "Eliminado con éxito" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

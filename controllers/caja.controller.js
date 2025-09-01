const Caja = require("../models/caja.model");
const { recalculateCajaTotals } = require("../services/cajaService");

// Obtener la caja única (o la primera)
async function getCaja(req, res) {
  try {
    let caja = await Caja.findOne();
    if (!caja) {
      // crear la caja por defecto si no existe
      caja = await Caja.create({ nombre: "Caja Principal", total_acumulado: 0, ingresos: [] });
    }
    res.json(caja);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

// Agregar ingreso (push al array ingresos y recalcular)
async function addIngreso(req, res) {
  try {
    const { fecha, valor, detalle, origen } = req.body;
    if (valor == null || isNaN(Number(valor)) || !fecha) {
      return res.status(400).json({ error: "fecha y valor son requeridos" });
    }

    // buscar o crear caja única
    let caja = await Caja.findOne();
    if (!caja) {
      caja = await Caja.create({ nombre: "Caja Principal", total_acumulado: 0, ingresos: [] });
    }

    const ingreso = {
      fecha: new Date(fecha), // asegúrate frontend envía YYYY-MM-DD o ISO
      valor: Number(valor),
      detalle: detalle || "",
      origen: origen || ""
    };

    caja.ingresos.push(ingreso);
    await caja.save();

    // recalcular totales (simple suma de ingresos)
    await recalculateCajaTotals(caja._id);

    // devolver caja actualizada
    const cajaAct = await Caja.findById(caja._id);
    res.status(201).json({ ingreso: cajaAct.ingresos[cajaAct.ingresos.length - 1], caja: cajaAct });
  } catch (err) {
    console.error("Error addIngreso:", err);
    res.status(500).json({ error: err.message });
  }
}

// Listar ingresos (con filtros opcionales: desde - hasta)
async function listIngresos(req, res) {
  try {
    const { desde, hasta } = req.query; // fechas en formato YYYY-MM-DD
    const caja = await Caja.findOne();
    if (!caja) return res.json([]);

    let ingresos = caja.ingresos || [];

    if (desde) {
      const desdeDate = new Date(desde + "T00:00:00");
      ingresos = ingresos.filter(i => new Date(i.fecha) >= desdeDate);
    }
    if (hasta) {
      const hastaDate = new Date(hasta + "T23:59:59.999");
      ingresos = ingresos.filter(i => new Date(i.fecha) <= hastaDate);
    }

    // ordenar descendente por fecha
    ingresos.sort((a,b) => new Date(b.fecha) - new Date(a.fecha));

    res.json(ingresos);
  } catch (err) {
    console.error("Error listIngresos:", err);
    res.status(500).json({ error: err.message });
  }
}

// Eliminar un ingreso (opcional)
async function deleteIngreso(req, res) {
  try {
    const { id } = req.params;
    const caja = await Caja.findOne();
    if (!caja) return res.status(404).json({ error: "Caja no encontrada" });

    caja.ingresos.id(id)?.remove();
    await caja.save();
    await recalculateCajaTotals(caja._id);

    res.json({ message: "Ingreso eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getCaja,
  addIngreso,
  listIngresos,
  deleteIngreso,
};

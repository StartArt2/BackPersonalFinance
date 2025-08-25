// controllers/abono.controller.js
const mongoose = require("mongoose");
const Abono = require("../models/abono.model");
const Deuda = require("../models/deuda.model");

// helpers
const toNumber = (v) => {
  const n = Number(v);
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100) / 100; // 2 decimales
};

const round2 = (v) => Math.round(v * 100) / 100;

exports.createAbono = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { deuda_id, valor, fecha, detalle } = req.body;
    if (!deuda_id || valor == null) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Falta deuda_id o valor" });
    }

    const valorNum = toNumber(valor);
    if (valorNum <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "El valor debe ser mayor que 0" });
    }

    const deuda = await Deuda.findById(deuda_id).session(session);
    if (!deuda) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Deuda no encontrada" });
    }

    // Política por defecto: rechazar abonos que superen el saldo (evita saldo negativo)
    if (valorNum > deuda.saldo_actual) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "El abono supera el saldo pendiente" });
    }

    const abono = new Abono({
      deuda_id,
      fecha: fecha ? new Date(fecha) : new Date(),
      valor: valorNum,
      detalle,
    });

    await abono.save({ session });

    deuda.saldo_actual = round2(deuda.saldo_actual - valorNum);
    deuda.abonos = deuda.abonos || [];
    deuda.abonos.push(abono._id);
    await deuda.save({ session });

    await session.commitTransaction();
    session.endSession();

    const deudaPop = await Deuda.findById(deuda._id).populate("abonos");

    return res.status(201).json({ abono, deuda: deudaPop });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("createAbono error:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.getAbonos = async (req, res) => {
  try {
    // puedes popular la deuda si lo deseas: .populate('deuda_id')
    const items = await Abono.find().sort({ fecha: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAbonoById = async (req, res) => {
  try {
    const item = await Abono.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "No encontrado" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAbono = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const id = req.params.id;
    const { deuda_id: newDeudaId, valor: newValorRaw, fecha, detalle } = req.body;

    const abonoOld = await Abono.findById(id).session(session);
    if (!abonoOld) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Abono no encontrado" });
    }

    const oldDeudaId = String(abonoOld.deuda_id);
    const oldValor = toNumber(abonoOld.valor);
    const newValor = newValorRaw != null ? toNumber(newValorRaw) : oldValor;

    if (newValor <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "El valor debe ser mayor que 0" });
    }

    // Si la deuda se cambia -> necesitamos revertir en deuda antigua y aplicar en deuda nueva
    if (newDeudaId && String(newDeudaId) !== oldDeudaId) {
      const oldDeuda = await Deuda.findById(oldDeudaId).session(session);
      const newDeuda = await Deuda.findById(newDeudaId).session(session);
      if (!oldDeuda || !newDeuda) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: "Deuda (antigua o nueva) no encontrada" });
      }

      // Devolver valor al saldo de la deuda antigua (porque el abono ya no pertenece)
      oldDeuda.saldo_actual = round2(oldDeuda.saldo_actual + oldValor);
      oldDeuda.abonos = (oldDeuda.abonos || []).filter(aid => String(aid) !== String(abonoOld._id));
      await oldDeuda.save({ session });

      // Validación: no permitir que nuevo abono deje saldo negativo (policy)
      if (newValor > newDeuda.saldo_actual) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: "El nuevo abono supera el saldo de la nueva deuda" });
      }

      // Aplicar nuevo valor en la nueva deuda
      newDeuda.saldo_actual = round2(newDeuda.saldo_actual - newValor);
      newDeuda.abonos = newDeuda.abonos || [];
      newDeuda.abonos.push(abonoOld._id);
      await newDeuda.save({ session });

      // actualizar abono con nueva deuda y valor
      abonoOld.deuda_id = newDeudaId;
      abonoOld.valor = newValor;
      if (fecha) abonoOld.fecha = new Date(fecha);
      if (detalle !== undefined) abonoOld.detalle = detalle;
      await abonoOld.save({ session });

      await session.commitTransaction();
      session.endSession();

      const deudaPop = await Deuda.findById(newDeudaId).populate("abonos");
      return res.json({ abono: abonoOld, deuda: deudaPop });
    }

    // Si la deuda no cambia: ajustamos la diferencia en la misma deuda
    const deuda = await Deuda.findById(abonoOld.deuda_id).session(session);
    if (!deuda) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Deuda relacionada no encontrada" });
    }

    const diff = round2(newValor - oldValor); // si diff>0 => resta más del saldo; si diff<0 => se aumenta saldo
    // Validación: no permitir que saldo sea negativo (policy)
    if (diff > 0 && diff > deuda.saldo_actual) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "La actualización provocaría saldo negativo en la deuda" });
    }

    deuda.saldo_actual = round2(deuda.saldo_actual - diff);
    await deuda.save({ session });

    // actualizar abono
    abonoOld.valor = newValor;
    if (fecha) abonoOld.fecha = new Date(fecha);
    if (detalle !== undefined) abonoOld.detalle = detalle;
    await abonoOld.save({ session });

    await session.commitTransaction();
    session.endSession();

    const deudaPop = await Deuda.findById(deuda._id).populate("abonos");
    return res.json({ abono: abonoOld, deuda: deudaPop });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("updateAbono error:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.deleteAbono = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const id = req.params.id;
    const abono = await Abono.findById(id).session(session);
    if (!abono) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Abono no encontrado" });
    }

    const deuda = await Deuda.findById(abono.deuda_id).session(session);
    if (!deuda) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Deuda relacionada no encontrada" });
    }

    // devolver valor
    deuda.saldo_actual = round2(deuda.saldo_actual + abono.valor);
    deuda.abonos = (deuda.abonos || []).filter(aid => String(aid) !== String(abono._id));
    await deuda.save({ session });

    await Abono.findByIdAndDelete(id).session(session);

    await session.commitTransaction();
    session.endSession();

    const deudaPop = await Deuda.findById(deuda._id).populate("abonos");
    return res.json({ message: "Eliminado con éxito", deuda: deudaPop });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("deleteAbono error:", err);
    return res.status(500).json({ error: err.message });
  }
};

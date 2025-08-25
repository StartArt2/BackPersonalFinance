// scripts/migrate-fechas.js
const mongoose = require('mongoose');
require('dotenv').config();
const GastoFijo = require('../models/gastoFijo.model');
const GastoVariable = require('../models/gastoVariable.model');
const { toLocalStartOfDay } = require('../utils/dateUtils');

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  const gf = await GastoFijo.find({}); 
  for (const doc of gf) {
    if (typeof doc.fecha === 'string') {
      doc.fecha = toLocalStartOfDay(doc.fecha);
      await doc.save();
    }
  }
  const gv = await GastoVariable.find({});
  for (const doc of gv) {
    if (typeof doc.fecha === 'string') {
      doc.fecha = toLocalStartOfDay(doc.fecha);
      await doc.save();
    }
  }
  console.log('Migración completada');
  await mongoose.disconnect();
}

migrate().catch(err => { console.error(err); process.exit(1); });

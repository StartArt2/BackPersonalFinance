const express = require('express');
const router = express.Router();
const cajaController = require('../controllers/caja.controller');

router.get('/', cajaController.getCaja); // GET /api/caja
router.post('/ingresos', cajaController.addIngreso); // POST /api/caja/ingresos
router.get('/ingresos', cajaController.listIngresos); // GET /api/caja/ingresos?desde=2025-08-01&hasta=2025-08-31
router.delete('/ingresos/:id', cajaController.deleteIngreso); // DELETE /api/caja/ingresos/:id

module.exports = router;

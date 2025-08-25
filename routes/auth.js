const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'cambiar_esto_en_produccion';
const SALT_ROUNDS = 10;

// Register: crea usuario en estado "pending"
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Faltan campos' });
    try {
        const exists = await User.findOne({ username });
        if (exists) return res.status(409).json({ message: 'username ya registrado' });
        const hash = await bcrypt.hash(password, SALT_ROUNDS);
        const user = new User({ username, password: hash, status: 'pending' });
        await user.save();
        return res.status(201).json({ message: 'Solicitud recibida. Espera aprobación.' });
    } catch (err) {
        console.error("❌ Error en /register:", err);
        return res.status(500).json({ message: 'Error interno' });
    }
});

// Admin aprueba cuenta -> cambia status a 'active'
router.post('/approve/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        user.status = 'active';
        await user.save();
        return res.json({ message: 'Usuario aprobado' });
    } catch (err) {
        return res.status(500).json({ message: 'Error interno' });
    }
});

// Login: solo usuarios activos reciben token
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Faltan campos' });
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });
        if (user.status !== 'active') return res.status(403).json({ message: 'Cuenta no activa' });
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });

        const payload = { id: user._id, role: user.role, username: user.username };
        // Sin expiresIn => token JWT "infinito"
        const token = jwt.sign(payload, JWT_SECRET);
        return res.json({ token });
    } catch (err) {
        return res.status(500).json({ message: 'Error interno' });
    }
});

// Perfil del usuario autenticado
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // excluye el hash
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    return res.json({ user });
  } catch (err) {
    console.error("❌ Error en /profile:", err);
    return res.status(500).json({ message: 'Error interno' });
  }
});

module.exports = router;
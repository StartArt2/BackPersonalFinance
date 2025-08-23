const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true }, // 👈 cambiar aquí
    password: { type: String, required: true },
    role: { type: String, enum: ['user','admin'], default: 'user' },
    status: { type: String, enum: ['pending','active','rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
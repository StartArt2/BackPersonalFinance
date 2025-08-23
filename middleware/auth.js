const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cambiar_esto_en_produccion';

function authenticate(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'No token' });
    const token = auth.split(' ')[1];
    try {
        // Nota: no se pasa expiresIn => token sin exp
        const payload = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido' });
    }
}

function adminOnly(req, res, next) {
    if (!req.user) return res.status(401).json({ message: 'No autenticado' });
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Requiere role admin' });
    next();
}

module.exports = { authenticate, adminOnly };
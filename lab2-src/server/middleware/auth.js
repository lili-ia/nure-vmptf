const jwt = require('jsonwebtoken');

const secret = () => process.env.JWT_SECRET || 'dev_secret';

exports.authRequired = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Потрібна авторизація' });
  try {
    req.user = jwt.verify(token, secret());
    next();
  } catch {
    res.status(401).json({ error: 'Потрібна авторизація' });
  }
};

exports.authOptional = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) try { req.user = jwt.verify(token, secret()); } catch {}
  next();
};

exports.adminRequired = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ error: 'Потрібні права адміністратора' });
  next();
};

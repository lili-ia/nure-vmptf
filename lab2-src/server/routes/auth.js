const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
const sign = (user) => jwt.sign(
  { id: user.id, username: user.username, email: user.email, role: user.role },
  process.env.JWT_SECRET || 'dev_secret',
  { expiresIn: '7d' }
);

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username?.trim() || !email?.trim() || !password)
    return res.status(400).json({ error: 'Заповніть всі поля' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Пароль — мінімум 6 символів' });

  try {
    const { rows: [{ count }] } = await pool.query('SELECT COUNT(*) FROM users');
    const role = parseInt(count) === 0 ? 'admin' : 'user';
    const hash = await bcrypt.hash(password, 10);

    const { rows: [user] } = await pool.query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at`,
      [username.trim(), email.trim().toLowerCase(), hash, role]
    );
    res.status(201).json({ token: sign(user), user });
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ error: err.constraint.includes('email') ? 'Email вже зайнятий' : 'Ім\'я вже зайняте' });
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Заповніть всі поля' });

  try {
    const { rows: [user] } = await pool.query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (!user || !await bcrypt.compare(password, user.password_hash))
      return res.status(401).json({ error: 'Невірний email або пароль' });

    const { password_hash, ...safeUser } = user;
    res.json({ token: sign(safeUser), user: safeUser });
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// GET /api/auth/me
router.get('/me', authRequired, async (req, res) => {
  try {
    const { rows: [user] } = await pool.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!user) return res.status(404).json({ error: 'Користувача не знайдено' });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

module.exports = router;

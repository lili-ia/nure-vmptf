const express = require('express');
const { pool } = require('../db');
const { authRequired, adminRequired } = require('../middleware/auth');

const router = express.Router();

// GET /api/users — список всіх (тільки admin)
router.get('/', authRequired, adminRequired, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.username, u.email, u.role, u.created_at,
              COUNT(v.id)::int AS video_count
       FROM users u
       LEFT JOIN videos v ON v.user_id = u.id
       GROUP BY u.id ORDER BY u.created_at`
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// PATCH /api/users/:id/role — змінити роль (admin)
router.patch('/:id/role', authRequired, adminRequired, async (req, res) => {
  const { role } = req.body;
  if (!['admin', 'user'].includes(role))
    return res.status(400).json({ error: 'Невірна роль' });
  if (req.params.id === req.user.id)
    return res.status(400).json({ error: 'Не можна змінити власну роль' });

  try {
    const { rows: [user] } = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, email, role',
      [role, req.params.id]
    );
    if (!user) return res.status(404).json({ error: 'Користувача не знайдено' });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// DELETE /api/users/:id (admin)
router.delete('/:id', authRequired, adminRequired, async (req, res) => {
  if (req.params.id === req.user.id)
    return res.status(400).json({ error: 'Не можна видалити власний акаунт' });

  try {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Користувача не знайдено' });
    res.json({ message: 'Користувача видалено' });
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

module.exports = router;

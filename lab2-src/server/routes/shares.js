const express = require('express');
const { pool } = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// GET /api/shares/inbox — відео, надіслані поточному користувачу
router.get('/inbox', authRequired, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT vs.id, vs.message, vs.created_at,
              v.id AS video_id, v.title, v.mimetype, v.size, v.views,
              u.username AS from_username
       FROM video_shares vs
       JOIN videos v ON vs.video_id = v.id
       JOIN users u ON vs.from_user_id = u.id
       WHERE vs.to_user_id = $1
       ORDER BY vs.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch { res.status(500).json({ error: 'Помилка сервера' }); }
});

// DELETE /api/shares/:id — видалити повідомлення з inbox
router.delete('/:id', authRequired, async (req, res) => {
  try {
    const { rows: [share] } = await pool.query('SELECT * FROM video_shares WHERE id = $1', [req.params.id]);
    if (!share) return res.status(404).json({ error: 'Не знайдено' });
    if (share.to_user_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Немає прав' });

    await pool.query('DELETE FROM video_shares WHERE id = $1', [req.params.id]);
    res.json({ message: 'Видалено' });
  } catch { res.status(500).json({ error: 'Помилка сервера' }); }
});

module.exports = router;

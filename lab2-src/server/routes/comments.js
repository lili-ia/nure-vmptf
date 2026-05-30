const express = require('express');
const { pool } = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// GET /api/videos/:videoId/comments
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM comments WHERE video_id = $1 ORDER BY created_at',
      [req.params.videoId]
    );
    res.json(rows);
  } catch { res.status(500).json({ error: 'Помилка сервера' }); }
});

// POST /api/videos/:videoId/comments
router.post('/', authRequired, async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'Текст коментаря порожній' });

  try {
    const { rows: [video] } = await pool.query('SELECT id FROM videos WHERE id = $1', [req.params.videoId]);
    if (!video) return res.status(404).json({ error: 'Відео не знайдено' });

    const { rows: [comment] } = await pool.query(
      `INSERT INTO comments (video_id, user_id, author_name, text)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.params.videoId, req.user.id, req.user.username, text.trim()]
    );
    res.status(201).json(comment);
  } catch { res.status(500).json({ error: 'Помилка сервера' }); }
});

// DELETE handler — монтується окремо в index.js як DELETE /api/comments/:id
router.deleteOne = async (req, res) => {
  try {
    const { rows: [comment] } = await pool.query('SELECT * FROM comments WHERE id = $1', [req.params.id]);
    if (!comment) return res.status(404).json({ error: 'Коментар не знайдено' });
    if (comment.user_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Немає прав для видалення' });

    await pool.query('DELETE FROM comments WHERE id = $1', [req.params.id]);
    res.json({ message: 'Коментар видалено' });
  } catch { res.status(500).json({ error: 'Помилка сервера' }); }
};

module.exports = router;

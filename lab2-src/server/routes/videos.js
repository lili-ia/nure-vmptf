const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
  }),
  fileFilter: (req, file, cb) => {
    const allowed = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Дозволені лише відеофайли'));
  },
  limits: { fileSize: 500 * 1024 * 1024 },
});

// GET /api/videos
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT v.*, u.username AS uploader
       FROM videos v LEFT JOIN users u ON v.user_id = u.id
       ORDER BY v.uploaded_at DESC`
    );
    res.json(rows);
  } catch { res.status(500).json({ error: 'Помилка сервера' }); }
});

// GET /api/videos/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows: [video] } = await pool.query(
      `SELECT v.*, u.username AS uploader
       FROM videos v LEFT JOIN users u ON v.user_id = u.id
       WHERE v.id = $1`,
      [req.params.id]
    );
    if (!video) return res.status(404).json({ error: 'Відео не знайдено' });
    res.json(video);
  } catch { res.status(500).json({ error: 'Помилка сервера' }); }
});

// POST /api/videos
router.post('/', authRequired, upload.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не надано' });
  const { title, description } = req.body;
  try {
    const { rows: [video] } = await pool.query(
      `INSERT INTO videos (user_id, title, description, filename, original_name, size, mimetype)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.id, title || req.file.originalname, description || '',
       req.file.filename, req.file.originalname, req.file.size, req.file.mimetype]
    );
    res.status(201).json(video);
  } catch { res.status(500).json({ error: 'Помилка сервера' }); }
});

// DELETE /api/videos/:id
router.delete('/:id', authRequired, async (req, res) => {
  try {
    const { rows: [video] } = await pool.query('SELECT * FROM videos WHERE id = $1', [req.params.id]);
    if (!video) return res.status(404).json({ error: 'Відео не знайдено' });
    if (video.user_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Немає прав для видалення' });

    await pool.query('DELETE FROM videos WHERE id = $1', [req.params.id]);
    const filePath = path.join(UPLOADS_DIR, video.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ message: 'Відео видалено' });
  } catch { res.status(500).json({ error: 'Помилка сервера' }); }
});

// POST /api/videos/:id/share
router.post('/:id/share', authRequired, async (req, res) => {
  const { username, message } = req.body;
  if (!username?.trim()) return res.status(400).json({ error: 'Вкажіть ім\'я користувача' });

  try {
    const { rows: [video] } = await pool.query('SELECT id FROM videos WHERE id = $1', [req.params.id]);
    if (!video) return res.status(404).json({ error: 'Відео не знайдено' });

    const { rows: [target] } = await pool.query('SELECT id FROM users WHERE username = $1', [username.trim()]);
    if (!target) return res.status(404).json({ error: `Користувача «${username}» не знайдено` });
    if (target.id === req.user.id) return res.status(400).json({ error: 'Не можна поділитися з собою' });

    const { rows: [share] } = await pool.query(
      `INSERT INTO video_shares (video_id, from_user_id, to_user_id, message)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.params.id, req.user.id, target.id, message?.trim() || '']
    );
    res.status(201).json(share);
  } catch { res.status(500).json({ error: 'Помилка сервера' }); }
});

module.exports = router;

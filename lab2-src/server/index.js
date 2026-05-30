require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { init: initDB, pool } = require('./db');
const { authRequired } = require('./middleware/auth');
const commentsRouter = require('./routes/comments');

const app = express();
const PORT = process.env.PORT || 5000;
const UPLOADS_DIR = path.join(__dirname, 'uploads');

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/videos/:videoId/comments',commentsRouter);
app.delete('/api/comments/:id', authRequired, commentsRouter.deleteOne);
app.use('/api/shares', require('./routes/shares'));

app.get('/stream/:id', async (req, res) => {
  try {
    const { rows: [video] } = await pool.query('SELECT * FROM videos WHERE id = $1', [req.params.id]);
    if (!video) return res.status(404).json({ error: 'Відео не знайдено' });

    const filePath = path.join(UPLOADS_DIR, video.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Файл не знайдено' });

    await pool.query('UPDATE videos SET views = views + 1 WHERE id = $1', [req.params.id]);

    const fileSize = fs.statSync(filePath).size;
    const range = req.headers.range;

    if (range) {
      const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
      const start = parseInt(startStr, 10);
      const end = endStr ? parseInt(endStr, 10) : Math.min(start + 1024 * 1024, fileSize - 1);
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
        'Content-Type': video.mimetype,
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, { 'Content-Length': fileSize, 'Content-Type': video.mimetype });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch { res.status(500).json({ error: 'Помилка сервера' }); }
});

initDB()
  .then(() => app.listen(PORT, () => console.log(`http://localhost:${PORT}`)))
  .catch(err => { console.error(err.message); process.exit(1); });

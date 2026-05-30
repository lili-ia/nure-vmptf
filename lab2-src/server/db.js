require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username    VARCHAR(50)  UNIQUE NOT NULL,
      email       VARCHAR(200) UNIQUE NOT NULL,
      password_hash VARCHAR(200) NOT NULL,
      role        VARCHAR(20)  NOT NULL DEFAULT 'user',
      created_at  TIMESTAMPTZ  DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS videos (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
      title         VARCHAR(200) NOT NULL,
      description   TEXT NOT NULL DEFAULT '',
      filename      VARCHAR(200) NOT NULL,
      original_name VARCHAR(200) NOT NULL,
      size          BIGINT NOT NULL,
      mimetype      VARCHAR(100) NOT NULL,
      uploaded_at   TIMESTAMPTZ DEFAULT NOW(),
      views         INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS comments (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      video_id    UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
      user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
      author_name VARCHAR(60) NOT NULL,
      text        TEXT NOT NULL,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS video_shares (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      video_id      UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
      from_user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      to_user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      message       TEXT NOT NULL DEFAULT '',
      created_at    TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

module.exports = { pool, init };

import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 3001;

// ── Neon PostgreSQL connection ──────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ── Ensure database tables exist ───────────────────────────
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      google_sub TEXT UNIQUE,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      picture TEXT,
      provider TEXT DEFAULT 'email',
      last_login TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS user_datasets (
      id SERIAL PRIMARY KEY,
      user_email TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_size TEXT NOT NULL,
      format TEXT NOT NULL,
      records INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Active',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('✅ Database tables (users & user_datasets) verified');
}

// ── POST /api/upsert-user ────────────────────────────────────
app.post('/api/upsert-user', async (req, res) => {
  const { google_sub, name, email, picture, provider } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO users (google_sub, name, email, picture, provider, last_login)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (email) DO UPDATE
         SET last_login = NOW(),
             name = EXCLUDED.name,
             picture = COALESCE(EXCLUDED.picture, users.picture),
             google_sub = COALESCE(EXCLUDED.google_sub, users.google_sub)
       RETURNING *`,
      [google_sub || null, name, email, picture || null, provider || 'email']
    );

    console.log(`✅ User upserted: ${email}`);
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error('❌ DB error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/upload-dataset ─────────────────────────────────
app.post('/api/upload-dataset', async (req, res) => {
  const { user_email, file_name, file_size, format, records } = req.body;

  if (!user_email || !file_name) {
    return res.status(400).json({ error: 'User email and file name are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO user_datasets (user_email, file_name, file_size, format, records, status)
       VALUES ($1, $2, $3, $4, $5, 'Active')
       RETURNING *`,
      [user_email, file_name, file_size || '0 MB', format || 'CSV', records || 1000]
    );

    console.log(`✅ Dataset saved to Neon DB for ${user_email}: ${file_name}`);
    res.json({ success: true, dataset: result.rows[0] });
  } catch (err) {
    console.error('❌ DB Dataset upload error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/datasets/:email ──────────────────────────────────
app.get('/api/datasets/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM user_datasets WHERE user_email = $1 ORDER BY created_at DESC',
      [email]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/users — list all logged-in users ───────────────
app.get('/api/users', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, provider, last_login, created_at FROM users ORDER BY last_login DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 API server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('❌ Failed to init DB:', err.message);
  process.exit(1);
});

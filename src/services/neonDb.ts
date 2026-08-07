// Neon PostgreSQL HTTP Serverless Driver for Direct Database Queries from Web App
const NEON_DB_URL = 'postgresql://neondb_owner:npg_sdxZm0qb1oKN@ep-long-feather-ax3yoprj-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require';
const NEON_HTTP_ENDPOINT = 'https://ep-long-feather-ax3yoprj-pooler.c-4.us-east-2.aws.neon.tech/sql';

export async function executeNeonQuery(sql: string, params: any[] = []) {
  try {
    const res = await fetch(NEON_HTTP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Neon-Connection-String': NEON_DB_URL,
      },
      body: JSON.stringify({ query: sql, params }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Neon Direct Query Error:', err);
    return null;
  }
}

export async function saveUserToNeonDirect(user: { email: string; name: string; picture?: string; sub?: string }, provider: string = 'email') {
  const sql = `
    INSERT INTO users (google_sub, name, email, picture, provider, last_login)
    VALUES ($1, $2, $3, $4, $5, NOW())
    ON CONFLICT (email) DO UPDATE
      SET last_login = NOW(),
          name = EXCLUDED.name,
          picture = COALESCE(EXCLUDED.picture, users.picture),
          google_sub = COALESCE(EXCLUDED.google_sub, users.google_sub)
    RETURNING *;
  `;
  const params = [user.sub || null, user.name, user.email, user.picture || null, provider];
  
  // Try Backend API first, fallback to Direct HTTP Neon Query if backend API is offline
  const API_URL = import.meta.env.VITE_API_URL || '';
  if (API_URL) {
    try {
      const apiRes = await fetch(`${API_URL}/api/upsert-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ google_sub: user.sub, name: user.name, email: user.email, picture: user.picture, provider }),
      });
      const data = await apiRes.json();
      if (data.success) return data;
    } catch {
      // API call failed, fallback below
    }
  }

  // Direct Serverless Neon Query (works on Vercel & Render out-of-the-box without extra backend setup)
  return await executeNeonQuery(sql, params);
}

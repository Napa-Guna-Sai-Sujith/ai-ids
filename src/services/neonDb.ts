// Direct Neon PostgreSQL HTTP Serverless Service
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
    console.error('❌ Neon Direct HTTP Query Error:', err);
    return null;
  }
}

export async function saveUserToNeonDirect(
  user: { email: string; name: string; picture?: string; sub?: string },
  provider: string = 'email'
) {
  if (!user?.email) return null;

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
  const params = [user.sub || null, user.name || user.email.split('@')[0], user.email, user.picture || null, provider];

  console.log(`📡 Saving user ${user.email} directly to Neon DB...`);
  const result = await executeNeonQuery(sql, params);
  
  if (result && result.rows) {
    console.log('✅ User successfully saved to Neon DB:', result.rows[0]);
  } else {
    console.warn('⚠️ Could not save user to Neon DB:', result);
  }
  
  return result;
}

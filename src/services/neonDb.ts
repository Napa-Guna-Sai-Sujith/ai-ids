// Direct Neon PostgreSQL Serverless Service (CORS & Mobile compatible)
const NEON_DB_URL = 'postgresql://neondb_owner:npg_sdxZm0qb1oKN@ep-long-feather-ax3yoprj-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require';
const NEON_HTTP_ENDPOINT = 'https://ep-long-feather-ax3yoprj-pooler.c-4.us-east-2.aws.neon.tech/sql';

export async function executeNeonQuery(sql: string, params: any[] = []) {
  try {
    // Use text/plain Content-Type to avoid CORS preflight OPTION restrictions across all origins
    const res = await fetch(NEON_HTTP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'Neon-Connection-String': NEON_DB_URL,
      },
      body: JSON.stringify({ query: sql, params }),
    });

    if (!res.ok) {
      console.warn('Neon HTTP Status:', res.status);
      return null;
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('❌ Neon Direct Query Error:', err);
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

export async function saveDatasetToNeonDirect(dataset: {
  user_email: string;
  file_name: string;
  file_size: string;
  format: string;
  records: number;
}) {
  if (!dataset?.user_email) return null;

  const sql = `
    INSERT INTO user_datasets (user_email, file_name, file_size, format, records, status)
    VALUES ($1, $2, $3, $4, $5, 'Active')
    RETURNING *;
  `;
  const params = [dataset.user_email, dataset.file_name, dataset.file_size, dataset.format, dataset.records];

  console.log(`📁 Saving dataset "${dataset.file_name}" to Neon DB for ${dataset.user_email}...`);
  const result = await executeNeonQuery(sql, params);
  if (result && result.rows) {
    console.log('✅ Dataset saved to Neon DB:', result.rows[0]);
  }
  return result;
}

export async function fetchUserDatasetsFromNeon(email: string) {
  if (!email) return [];
  const sql = `SELECT * FROM user_datasets WHERE user_email = $1 ORDER BY created_at DESC;`;
  const result = await executeNeonQuery(sql, [email]);
  if (result && result.rows) {
    return result.rows;
  }
  return [];
}

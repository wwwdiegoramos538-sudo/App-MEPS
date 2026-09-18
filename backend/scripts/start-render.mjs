import { execSync } from 'child_process';
import pg from 'pg';

const PUSH_TIMEOUT_MS = 25000;
const SEED_TIMEOUT_MS = 15000;
const CONNECT_TIMEOUT_MS = 8000;

async function dbReachable() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('[MEPS] DATABASE_URL no esta definida');
    return false;
  }

  const client = new pg.Client({
    connectionString: url,
    connectionTimeoutMillis: CONNECT_TIMEOUT_MS,
  });

  try {
    await client.connect();
    await client.query('SELECT 1');
    await client.end();
    return true;
  } catch (err) {
    console.error('[MEPS] PostgreSQL no alcanzable:', err.message);
    try {
      await client.end();
    } catch {
      /* ignore */
    }
    return false;
  }
}

async function setupDb() {
  if (!(await dbReachable())) {
    console.error('[MEPS] Arrancando API sin migrar. Login/datos pueden fallar hasta que la BD este viva.');
    return;
  }

  try {
    execSync('npx prisma db push --accept-data-loss --skip-generate', {
      stdio: 'inherit',
      timeout: PUSH_TIMEOUT_MS,
      env: process.env,
    });
  } catch (err) {
    console.error('[MEPS] prisma db push fallo o tardo demasiado:', err.message);
  }

  try {
    execSync('node prisma/seed.js', {
      stdio: 'inherit',
      timeout: SEED_TIMEOUT_MS,
      env: process.env,
    });
  } catch (err) {
    console.error('[MEPS] seed fallo o tardo demasiado:', err.message);
  }
}

await setupDb();
await import('../src/index.js');

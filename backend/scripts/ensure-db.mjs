import EmbeddedPostgres from 'embedded-postgres';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import net from 'net';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.join(__dirname, '..');
const dataDir = path.join(backendRoot, 'data', 'postgres');
const lockFile = path.join(backendRoot, 'data', '.pg-started');

const PG_USER = 'postgres';
const PG_PASS = 'meps2026';
const PG_PORT = 5432;
const DB_NAME = 'meps_db';

const DATABASE_URL = `postgresql://${PG_USER}:${PG_PASS}@localhost:${PG_PORT}/${DB_NAME}?schema=public`;
// En Windows, --locale=C solo no basta; ICU fuerza UTF-8 real.
const UTF8_INITDB_FLAGS = [
  '--encoding=UTF8',
  '--locale=C',
  '--lc-collate=C',
  '--lc-ctype=C',
  '--locale-provider=icu',
  '--icu-locale=en-US',
];
const setupFlag = path.join(backendRoot, 'data', '.db-setup-done');
const utf8Marker = path.join(backendRoot, 'data', '.pg-utf8');

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host: '127.0.0.1' }, () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('error', () => resolve(false));
    socket.setTimeout(2000, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function waitForPort(port, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    if (await isPortOpen(port)) return true;
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

function updateEnvFile() {
  const envPath = path.join(backendRoot, '.env');
  let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
  const line = `DATABASE_URL=${DATABASE_URL}`;
  if (content.match(/^DATABASE_URL=/m)) {
    content = content.replace(/^DATABASE_URL=.*$/m, line);
  } else {
    content = `${line}\n${content}`;
  }
  fs.writeFileSync(envPath, content);
  process.env.DATABASE_URL = DATABASE_URL;
}

async function getServerEncoding() {
  const { default: pg } = await import('pg');
  const client = new pg.Client({
    connectionString: `postgresql://${PG_USER}:${PG_PASS}@localhost:${PG_PORT}/postgres`,
    connectionTimeoutMillis: 5000,
  });
  await client.connect();
  const { rows } = await client.query('SHOW server_encoding');
  await client.end();
  return rows[0]?.server_encoding;
}

async function stopPostgresOnPort() {
  const pidFile = path.join(dataDir, 'postmaster.pid');
  if (fs.existsSync(pidFile)) {
    try {
      const pid = fs.readFileSync(pidFile, 'utf8').split('\n')[0].trim();
      if (pid) execSync(`taskkill /F /PID ${pid} /T`, { stdio: 'ignore' });
    } catch {
      /* ignore */
    }
    try {
      fs.unlinkSync(pidFile);
    } catch {
      /* ignore */
    }
  }
  try {
    execSync('taskkill /F /IM postgres.exe /T', { stdio: 'ignore' });
  } catch {
    /* ignore */
  }
  for (let i = 0; i < 20; i++) {
    if (!(await isPortOpen(PG_PORT))) return;
    await new Promise((r) => setTimeout(r, 500));
  }
}

async function recreateClusterUtf8() {
  console.log('[MEPS DB] Recreando PostgreSQL en UTF8 (corrige errores con emojis/Unicode)...');
  await stopPostgresOnPort();
  if (fs.existsSync(dataDir)) {
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
  if (fs.existsSync(setupFlag)) fs.unlinkSync(setupFlag);
  if (fs.existsSync(utf8Marker)) fs.unlinkSync(utf8Marker);
  if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
}

async function tablesExist() {
  const { default: pg } = await import('pg');
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    connectionTimeoutMillis: 5000,
  });
  try {
    await client.connect();
    const res = await client.query(
      `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'`
    );
    return res.rowCount > 0;
  } catch {
    return false;
  } finally {
    await client.end().catch(() => {});
  }
}

async function runPrismaSetup() {
  console.log('[MEPS DB] Sincronizando tablas con Prisma...');
  execSync('npx prisma db push --accept-data-loss', {
    cwd: backendRoot,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL },
  });

  console.log('[MEPS DB] Creando usuario administrador...');
  execSync('node prisma/seed.js', {
    cwd: backendRoot,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL },
  });
  fs.mkdirSync(path.join(backendRoot, 'data'), { recursive: true });
  fs.writeFileSync(setupFlag, new Date().toISOString());
}

async function ensurePrismaReady() {
  if (!(await tablesExist())) {
    if (fs.existsSync(setupFlag)) fs.unlinkSync(setupFlag);
    await runPrismaSetup();
  } else if (!fs.existsSync(setupFlag)) {
    fs.mkdirSync(path.join(backendRoot, 'data'), { recursive: true });
    fs.writeFileSync(setupFlag, new Date().toISOString());
  }
}

async function main() {
  let mustReinit = false;

  if ((await isPortOpen(PG_PORT)) && fs.existsSync(dataDir)) {
    try {
      const enc = await getServerEncoding();
      if (enc && enc !== 'UTF8') {
        await recreateClusterUtf8();
        mustReinit = true;
      } else if (enc === 'UTF8') {
        fs.mkdirSync(path.join(backendRoot, 'data'), { recursive: true });
        fs.writeFileSync(utf8Marker, new Date().toISOString());
      }
    } catch {
      /* Si no podemos leer encoding, la app sanitiza texto */
    }
  }

  const alreadyRunning = (await isPortOpen(PG_PORT)) && !mustReinit;

  if (alreadyRunning && fs.existsSync(dataDir)) {
    console.log(`[MEPS DB] PostgreSQL ya activo en puerto ${PG_PORT}`);
    updateEnvFile();

    const { default: pg } = await import('pg');
    let connected = false;
    const maxAttempts = 10;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const client = new pg.Client({
          connectionString: `postgresql://${PG_USER}:${PG_PASS}@localhost:${PG_PORT}/postgres`,
          connectionTimeoutMillis: 4000,
        });

        await client.connect();
        const res = await client.query(
          'SELECT 1 FROM pg_database WHERE datname = $1',
          [DB_NAME]
        );

        if (res.rowCount === 0) {
          await client.query(`CREATE DATABASE "${DB_NAME}"`);
          console.log(`[MEPS DB] Base de datos ${DB_NAME} creada`);
        }
        await client.end();
        await ensurePrismaReady();

        connected = true;
        break;
      } catch (err) {
        if (attempt === maxAttempts - 1) {
          console.error('[MEPS DB] Puerto 5432 abierto pero no se pudo conectar con las credenciales del proyecto.');
          console.error('[MEPS DB]', err.message);
          console.error('[MEPS DB] Deten el PostgreSQL externo o usa DATABASE_URL en backend/.env con las credenciales correctas.');
          process.exit(1);
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    if (!connected) return;
    return;
  }

  const pgVersionFile = path.join(dataDir, 'PG_VERSION');

  if (fs.existsSync(pgVersionFile) && !fs.existsSync(utf8Marker)) {
    console.log('[MEPS DB] Cluster antiguo (WIN1252). Recreando en UTF8...');
    await recreateClusterUtf8();
  }

  console.log('[MEPS DB] Iniciando PostgreSQL embebido...');
  fs.mkdirSync(dataDir, { recursive: true });

  const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: PG_USER,
    password: PG_PASS,
    port: PG_PORT,
    persistent: true,
    initdbFlags: UTF8_INITDB_FLAGS,
  });

  const pidFile = path.join(dataDir, 'postmaster.pid');

  if (!fs.existsSync(pgVersionFile)) {
    await pg.initialise();
  } else if (fs.existsSync(pidFile)) {
    fs.unlinkSync(pidFile);
  }

  await pg.start();

  const ready = await waitForPort(PG_PORT);
  if (!ready) {
    console.error('[MEPS DB] Error: PostgreSQL no respondio a tiempo');
    process.exit(1);
  }

  console.log(`[MEPS DB] PostgreSQL activo en localhost:${PG_PORT}`);

  try {
    await pg.createDatabase(DB_NAME);
    console.log(`[MEPS DB] Base de datos ${DB_NAME} creada`);
  } catch (err) {
    if (!String(err).includes('already exists')) {
      console.log('[MEPS DB] Base de datos ya existe o no se pudo crear:', err.message);
    }
  }

  updateEnvFile();
  fs.writeFileSync(lockFile, String(process.pid));

  await ensurePrismaReady();

  const enc = await getServerEncoding();
  if (enc !== 'UTF8') {
    console.error(`[MEPS DB] Encoding incorrecto (${enc}). Borra backend/data/postgres y reinicia.`);
    process.exit(1);
  }
  fs.mkdirSync(path.join(backendRoot, 'data'), { recursive: true });
  fs.writeFileSync(utf8Marker, new Date().toISOString());

  console.log('[MEPS DB] Listo: postgresql://postgres:***@localhost:5432/meps_db');
  console.log('[MEPS DB] Admin: admin@meps.com / Admin123!');

  process.on('SIGINT', async () => {
    console.log('\n[MEPS DB] Deteniendo PostgreSQL...');
    await pg.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await pg.stop();
    process.exit(0);
  });

  await new Promise(() => {});
}

main().catch((err) => {
  console.error('[MEPS DB] Error fatal:', err);
  process.exit(1);
});

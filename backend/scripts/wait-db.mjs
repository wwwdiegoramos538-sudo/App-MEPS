import net from 'net';

const PG_PORT = parseInt(process.env.PG_PORT || '5432', 10);
const MAX_ATTEMPTS = 120;

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

async function canConnectDb() {
  try {
    const { default: pg } = await import('pg');
    const url =
      process.env.DATABASE_URL ||
      'postgresql://postgres:meps2026@localhost:5432/meps_db?schema=public';
    const client = new pg.Client({
      connectionString: url,
      connectionTimeoutMillis: 3000,
    });
    await client.connect();
    await client.query('SELECT 1');
    await client.end();
    return true;
  } catch {
    return false;
  }
}

async function main() {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    if (await isPortOpen(PG_PORT) && (await canConnectDb())) {
      console.log(`[MEPS] PostgreSQL disponible en puerto ${PG_PORT}`);
      return;
    }
    if (i % 5 === 0) {
      console.log(`[MEPS] Esperando PostgreSQL... (${i}/${MAX_ATTEMPTS})`);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  console.error('[MEPS] Timeout: PostgreSQL no disponible');
  process.exit(1);
}

main();

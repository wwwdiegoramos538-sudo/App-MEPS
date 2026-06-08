import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const backendRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres:meps2026@localhost:5432/meps_db?schema=public';

console.log('[MEPS] Configurando tablas...');
execSync('npx prisma db push --accept-data-loss', {
  cwd: backendRoot,
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL },
});

console.log('[MEPS] Ejecutando seed...');
execSync('node prisma/seed.js', {
  cwd: backendRoot,
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL },
});

console.log('[MEPS] Base de datos configurada correctamente');

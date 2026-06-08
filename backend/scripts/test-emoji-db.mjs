import pg from 'pg';
import { PrismaClient } from '@prisma/client';
import { sanitizeForDb } from '../src/utils/dbText.js';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:meps2026@localhost:5432/meps_db';

const prisma = new PrismaClient({ datasources: { db: { url: DATABASE_URL } } });

async function main() {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  const enc = await client.query('SHOW server_encoding');
  console.log('server_encoding:', enc.rows[0].server_encoding);
  await client.end();

  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('No hay usuarios. Ejecuta seed primero.');
    process.exit(1);
  }

  const emojiText = 'Hola mundo 🤝 y más 🎉 texto';
  const safe = sanitizeForDb(emojiText);
  console.log('Original length:', emojiText.length, 'Sanitized length:', safe.length);

  const t = await prisma.translation.create({
    data: {
      userId: user.id,
      sourceLanguage: 'es',
      targetLanguage: 'en',
      status: 'PROCESSING',
      sourceText: safe,
    },
  });

  await prisma.translation.update({
    where: { id: t.id },
    data: {
      status: 'COMPLETED',
      translatedText: sanitizeForDb('Hello world 🤝 and more 🎉 text'),
      provider: 'test',
    },
  });

  const updated = await prisma.translation.findUnique({ where: { id: t.id } });
  console.log('OK - translation saved:', updated.translatedText);
  await prisma.translation.delete({ where: { id: t.id } });
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('FAIL:', e.message);
  process.exit(1);
});

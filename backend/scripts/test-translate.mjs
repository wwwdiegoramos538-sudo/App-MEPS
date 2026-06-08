import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testFile = path.join(__dirname, '../uploads/test-translate.txt');

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const loginRes = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@meps.com', password: 'Admin123!' }),
  });

  if (!loginRes.ok) {
    console.error('Login failed:', loginRes.status);
    process.exit(1);
  }

  const { token } = await loginRes.json();
  console.log('Login OK');

  const form = new FormData();
  form.append('file', new Blob([fs.readFileSync(testFile)], { type: 'text/plain' }), 'test-translate.txt');
  form.append('sourceLanguage', 'es');
  form.append('targetLanguage', 'en');
  form.append('provider', 'auto');

  const translateRes = await fetch('http://localhost:4000/api/translations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  const body = await translateRes.json();
  if (!translateRes.ok) {
    console.error('Start failed:', translateRes.status, body);
    process.exit(1);
  }

  console.log('Started:', body.translation.status, body.translation.id);

  for (let i = 0; i < 60; i++) {
    await sleep(2000);
    const poll = await fetch(`http://localhost:4000/api/translations/${body.translation.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await poll.json();
    console.log('Poll:', data.translation.status);
    if (data.translation.status === 'COMPLETED') {
      console.log('Preview:', data.translation.translatedText?.slice(0, 200));
      return;
    }
    if (data.translation.status === 'FAILED') {
      console.error('FAILED');
      process.exit(1);
    }
  }

  console.error('Timeout');
  process.exit(1);
}

main().catch(console.error);

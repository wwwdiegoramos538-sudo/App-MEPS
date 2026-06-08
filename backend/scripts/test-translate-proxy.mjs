import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testFile = path.join(__dirname, '../uploads/test-translate.txt');

async function main() {
  const loginRes = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@meps.com', password: 'Admin123!' }),
  });
  const { token } = await loginRes.json();

  const form = new FormData();
  form.append('file', new Blob([fs.readFileSync(testFile)], { type: 'text/plain' }), 'test-translate.txt');
  form.append('sourceLanguage', 'auto');
  form.append('targetLanguage', 'en');
  form.append('provider', 'auto');

  console.log('Testing via Next.js proxy (3000)...');
  const proxyRes = await fetch('http://localhost:3000/api/translations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  console.log('Proxy status:', proxyRes.status);
  console.log('Proxy body:', (await proxyRes.text()).slice(0, 300));
}

main().catch(console.error);

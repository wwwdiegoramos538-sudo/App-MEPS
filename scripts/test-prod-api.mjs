import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const BASE = process.env.API_BASE || 'https://meps-frontend.onrender.com/api';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCX_FIXTURE = join(__dirname, '../backend/test-fixtures/sample-formatted.docx');

async function req(method, path, { token, body, formData } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !formData) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: formData || (body ? JSON.stringify(body) : undefined),
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text.slice(0, 200);
  }
  return { status: res.status, data };
}

const results = [];

function log(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'OK' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
}

async function main() {
  const health = await req('GET', '/health');
  log('Health', health.status === 200, health.status);

  const login = await req('POST', '/auth/login', {
    body: { email: 'qa-test@meps.com', password: 'any' },
  });
  log('Login open', login.status === 200, login.data?.error || login.data?.user?.email);
  const token = login.data?.token;
  if (!token) {
    console.log('\nNo token — backend may need OPEN_LOGIN=true redeploy');
    process.exit(1);
  }

  const profile = await req('GET', '/users/profile', { token });
  log('Profile', profile.status === 200, profile.data?.email);

  const stats = await req('GET', '/users/stats', { token });
  log('Stats', stats.status === 200);

  const langs = await req('GET', '/translations/languages');
  log('Languages', langs.status === 200, `${langs.data?.count || 0} langs`);

  const plans = await req('GET', '/subscriptions/plans');
  log('Plans', plans.status === 200);

  const sub = await req('GET', '/subscriptions/current', { token });
  log('Subscription', sub.status === 200, sub.data?.plan);

  const docs = await req('GET', '/documents', { token });
  log('Documents list', docs.status === 200);

  const trans = await req('GET', '/translations', { token });
  log('Translations list', trans.status === 200);

  const library = await req('GET', '/library', { token });
  log('Library', library.status === 200);

  const audio = await req('GET', '/audiobooks', { token });
  log('Audiobooks list', audio.status === 200);

  const designs = await req('GET', '/designs', { token });
  log('Designs list', designs.status === 200);

  const templates = await req('GET', '/designs/templates');
  log('Design templates', templates.status === 200);

  const chatGet = await req('GET', '/chat', { token });
  log('Chat history', chatGet.status === 200);

  const chatPost = await req('POST', '/chat', { token, body: { message: 'Hola, que es MEPS?' } });
  log('Chat send', chatPost.status === 200, chatPost.data?.reply?.slice?.(0, 60));

  const designCreate = await req('POST', '/designs', {
    token,
    body: { title: 'Test', templateId: 'minimal', content: { title: 'Hola' } },
  });
  log('Design create', designCreate.status === 201 || designCreate.status === 200, designCreate.data?.error);

  const checkout = await req('POST', '/subscriptions/checkout', {
    token,
    body: { plan: 'basic' },
  });
  log('Stripe checkout', checkout.status === 200 || checkout.status === 503, checkout.data?.error || 'url ok');

  // Text translation (small inline via file would need multipart - skip file upload in script)
  const txt = new Blob(['Hello world test'], { type: 'text/plain' });
  const fd = new FormData();
  fd.append('file', txt, 'test.txt');
  fd.append('targetLanguage', 'es');
  fd.append('sourceLanguage', 'en');
  fd.append('provider', 'auto');
  const transRes = await fetch(`${BASE}/translations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  const transData = await transRes.json().catch(() => ({}));
  log(
    'Translate file',
    transRes.status === 200 || transRes.status === 201 || transRes.status === 202,
    transData.error || transData.status || transRes.status
  );

  // DOCX con formato preservado
  try {
    const docxFile = existsSync(DOCX_FIXTURE) ? readFileSync(DOCX_FIXTURE) : null;
    if (docxFile) {
      const docxFd = new FormData();
      docxFd.append('file', new Blob([docxFile], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), 'sample-formatted.docx');
      docxFd.append('targetLanguage', 'es');
      docxFd.append('sourceLanguage', 'en');
      docxFd.append('provider', 'auto');
      const docxRes = await fetch(`${BASE}/translations`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: docxFd,
      });
      const docxData = await docxRes.json().catch(() => ({}));
      const docxId = docxData.translation?.id;
      let docxOk = false;
      let docxDetail = docxRes.status;
      if (docxId) {
        for (let i = 0; i < 90; i++) {
          await new Promise((r) => setTimeout(r, 3000));
          const st = await req('GET', `/translations/${docxId}`, { token });
          if (st.data?.translation?.status === 'COMPLETED') {
            const dl = await fetch(`${BASE}/translations/${docxId}/download`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const cd = dl.headers.get('content-disposition') || '';
            docxOk = dl.ok && cd.includes('.docx');
            docxDetail = docxOk ? 'docx download ok' : `download ${dl.status}`;
            break;
          }
          if (st.data?.translation?.status === 'FAILED') {
            docxDetail = st.data.translation.errorMessage || 'failed';
            break;
          }
        }
      }
      log('Translate DOCX formatted', docxOk, docxDetail);
    } else {
      log('Translate DOCX formatted', true, 'skipped (no fixture)');
    }
  } catch (e) {
    log('Translate DOCX formatted', false, e.message);
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

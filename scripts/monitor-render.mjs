/**
 * Monitor de salud MEPS en Render.
 * Uso: node scripts/monitor-render.mjs
 * Exit 0 = todo OK, Exit 1 = hay fallos
 */

const FRONTEND = process.env.FRONTEND_URL || 'https://meps-frontend.onrender.com';
const BACKEND = process.env.BACKEND_URL || 'https://meps-backend.onrender.com';
const TIMEOUT_MS = 120000;

const results = [];

function log(ok, name, detail = '', ms = 0) {
  results.push({ ok, name, detail, ms });
  const icon = ok ? 'OK' : 'FAIL';
  const time = ms ? ` (${Math.round(ms)}ms)` : '';
  console.log(`${icon} ${name}${time}${detail ? ` — ${detail}` : ''}`);
}

async function fetchWithTiming(url, options = {}) {
  const start = Date.now();
  const res = await fetch(url, { ...options, signal: AbortSignal.timeout(TIMEOUT_MS) });
  const ms = Date.now() - start;
  return { res, ms };
}

async function main() {
  console.log(`\nMEPS Render Monitor — ${new Date().toISOString()}\n`);

  try {
    const { res, ms } = await fetchWithTiming(FRONTEND);
    log(res.ok, 'Frontend', res.status, ms);
  } catch (e) {
    log(false, 'Frontend', e.message);
  }

  try {
    const { res, ms } = await fetchWithTiming(`${FRONTEND}/login`);
    log(res.ok, 'Pagina login', res.status, ms);
  } catch (e) {
    log(false, 'Pagina login', e.message);
  }

  try {
    const { res, ms } = await fetchWithTiming(`${BACKEND}/api/health`);
    const data = await res.json().catch(() => ({}));
    log(res.ok && data.status === 'ok', 'Backend directo', data.status || res.status, ms);
  } catch (e) {
    log(false, 'Backend directo', e.message);
  }

  try {
    const { res, ms } = await fetchWithTiming(`${FRONTEND}/api/health`);
    const data = await res.json().catch(() => ({}));
    const proxyOk = res.ok && (data.backend === 'ok' || data.status === 'ok');
    log(proxyOk, 'Backend via proxy', data.backend || data.status || res.status, ms);
  } catch (e) {
    log(false, 'Backend via proxy', e.message);
  }

  try {
    const { res, ms } = await fetchWithTiming(`${FRONTEND}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `monitor-${Date.now()}@meps.com`, password: 'monitor' }),
    });
    const data = await res.json().catch(() => ({}));
    log(res.ok && !!data.token, 'Login API', data.user?.email || data.error || res.status, ms);
  } catch (e) {
    log(false, 'Login API', e.message);
  }

  try {
    const loginRes = await fetch(`${FRONTEND}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'monitor-dashboard@meps.com', password: 'x' }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const loginData = await loginRes.json();
    if (!loginData.token) {
      log(false, 'Dashboard API', 'sin token');
    } else {
      const { res, ms } = await fetchWithTiming(`${FRONTEND}/api/users/stats`, {
        headers: { Authorization: `Bearer ${loginData.token}` },
      });
      log(res.ok, 'Dashboard API (stats)', res.status, ms);
    }
  } catch (e) {
    log(false, 'Dashboard API (stats)', e.message);
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);

  if (failed.length) {
    console.log('\nServicios con fallo:', failed.map((f) => f.name).join(', '));
    console.log('Nota: en plan gratis Render duerme tras ~15 min sin uso. La primera carga puede tardar 30-60s.');
    process.exit(1);
  }

  console.log('\nTodos los servicios responden correctamente.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

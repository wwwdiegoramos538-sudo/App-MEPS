/**
 * Despierta el backend en Render (plan gratis) antes de login u operaciones criticas.
 */
import { api } from './api';

const WAKE_ATTEMPTS = 3;
const WAKE_DELAY_MS = 6000;
const WAKE_TIMEOUT_MS = 90000;
const RATE_LIMIT_WAIT_MS = 45000;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function isRenderHost() {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.includes('onrender.com');
}

export async function wakeBackend(onStatus?: (msg: string) => void): Promise<boolean> {
  if (!isRenderHost()) return true;

  for (let attempt = 1; attempt <= WAKE_ATTEMPTS; attempt++) {
    onStatus?.(
      attempt === 1
        ? 'Conectando con el servidor...'
        : `Despertando servidor (${attempt}/${WAKE_ATTEMPTS})...`
    );
    try {
      await api.get('/health', { timeout: WAKE_TIMEOUT_MS });
      return true;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 429 && attempt < WAKE_ATTEMPTS) {
        onStatus?.('Servidor ocupado. Esperando un momento...');
        await sleep(RATE_LIMIT_WAIT_MS);
        continue;
      }
      if (attempt < WAKE_ATTEMPTS) await sleep(WAKE_DELAY_MS);
    }
  }
  return false;
}

export async function loginWithRetry(
  loginFn: () => Promise<{ data: { token: string; user: unknown } }>,
  onStatus?: (msg: string) => void
) {
  const attempts = isRenderHost() ? 3 : 2;

  for (let i = 1; i <= attempts; i++) {
    try {
      if (i > 1) {
        onStatus?.(`Reintentando login (${i}/${attempts})...`);
        await sleep(5000);
        await wakeBackend(onStatus);
      }
      return await loginFn();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 429 && i < attempts) {
        onStatus?.('Demasiadas solicitudes. Esperando 45 segundos...');
        await sleep(RATE_LIMIT_WAIT_MS);
        continue;
      }
      const retryable = !status || status >= 502 || status === 504;
      if (!retryable || i === attempts) throw err;
    }
  }

  throw new Error('No se pudo iniciar sesion');
}

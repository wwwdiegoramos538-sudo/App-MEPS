import { config } from '../config/index.js';

export function isRelayAvailable() {
  return Boolean(config.relayUrl && config.relaySecret && !config.relayUrl.includes('localhost'));
}

async function post(path, payload, timeoutMs) {
  const res = await fetch(`${config.relayUrl}/api/relay/${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-relay-key': config.relaySecret },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`Relay ${path}: ${data.error || res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export async function translateViaRelay(text, sourceLang, targetLang) {
  const data = await post('translate', { text, source: sourceLang, target: targetLang }, 58000);
  if (!data.text?.trim()) throw new Error('Relay devolvio traduccion vacia');
  return data.text;
}

export async function chatViaRelay(messages, temperature, timeoutMs = 58000) {
  const data = await post('chat', { messages, temperature }, timeoutMs);
  return data.content;
}

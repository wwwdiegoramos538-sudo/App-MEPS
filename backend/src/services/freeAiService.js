import { getLanguageName } from '../utils/languages.js';
import { isRelayAvailable, chatViaRelay } from './relayService.js';

const ENDPOINT = process.env.FREE_AI_URL || 'https://text.pollinations.ai/openai';
const MODEL = process.env.FREE_AI_MODEL || 'openai';
const CHUNK_SIZE = 3500;

const MIN_GAP_MS = 3500;
const RETRYABLE = new Set([402, 408, 425, 429, 500, 502, 503, 504]);

let queue = Promise.resolve();
let lastCallAt = 0;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function callOnce(messages, temperature, timeoutMs) {
  const wait = lastCallAt + MIN_GAP_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastCallAt = Date.now();

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, messages, temperature, private: true }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    const err = new Error(`IA gratuita no disponible (${res.status})`);
    err.retryable = RETRYABLE.has(res.status);
    throw err;
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content?.trim();
  if (!content) {
    const err = new Error('IA gratuita devolvio respuesta vacia');
    err.retryable = true;
    throw err;
  }
  return content;
}

export function freeAiChat(
  messages,
  { temperature = 0.3, timeoutMs = 90000, retries = 3, relayTimeoutMs = 58000 } = {}
) {
  const run = async () => {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      if (isRelayAvailable()) {
        try {
          const content = await chatViaRelay(messages, temperature, relayTimeoutMs);
          if (content) return content;
        } catch (err) {
          lastError = err;
        }
      }
      try {
        return await callOnce(messages, temperature, timeoutMs);
      } catch (err) {
        lastError = err;
        const retryable = err.retryable || err.name === 'TimeoutError' || err.name === 'TypeError';
        if (!retryable || attempt === retries) break;
        await sleep(5000 * (attempt + 1));
      }
    }
    throw lastError;
  };
  const result = queue.then(run, run);
  queue = result.catch(() => {});
  return result;
}

export async function translateWithFreeAi(text, targetLang, sourceLang = 'auto') {
  if (!text.trim()) return text;

  const target = getLanguageName(targetLang);
  const source = sourceLang === 'auto' ? 'el idioma que detectes' : getLanguageName(sourceLang);
  const system =
    `Eres un traductor profesional. Traduce de ${source} a ${target} (codigo ${targetLang}). ` +
    'Conserva saltos de linea, numeros, nombres propios y formato. ' +
    'Devuelve SOLO la traduccion, sin comillas, notas ni explicaciones.';

  const chunks = [];
  for (let i = 0; i < text.length; i += CHUNK_SIZE) {
    chunks.push(text.slice(i, i + CHUNK_SIZE));
  }

  const translated = [];
  for (const chunk of chunks) {
    if (!chunk.trim()) {
      translated.push(chunk);
      continue;
    }
    const out = await freeAiChat([
      { role: 'system', content: system },
      { role: 'user', content: chunk },
    ]);
    const lead = chunk.match(/^\s*/)[0];
    const trail = chunk.match(/\s*$/)[0];
    translated.push(lead + out + trail);
  }
  return translated.join('');
}

export function isFreeAiAvailable() {
  return process.env.FREE_AI_DISABLED !== 'true';
}

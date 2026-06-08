import * as deepl from 'deepl-node';
import { config } from '../config/index.js';

let translator = null;

function getTranslator() {
  if (!config.deeplApiKey) return null;
  if (!translator) {
    translator = new deepl.Translator(config.deeplApiKey);
  }
  return translator;
}

export async function translateWithDeepL(text, targetLang, sourceLang = null) {
  const client = getTranslator();
  if (!client) {
    throw new Error('DeepL API no configurada');
  }

  const target = normalizeDeepLLang(targetLang);
  const source =
    sourceLang && sourceLang !== 'auto' ? normalizeDeepLLang(sourceLang) : null;

  const result = await client.translateText(text, source, target);
  return Array.isArray(result) ? result.map((r) => r.text).join('\n') : result.text;
}

function normalizeDeepLLang(code) {
  const map = { 'pt-BR': 'PT-BR', zh: 'ZH', en: 'EN-US', pt: 'PT-PT' };
  const upper = map[code] || code.toUpperCase();
  return upper;
}

export async function isDeepLAvailable() {
  return !!getTranslator();
}

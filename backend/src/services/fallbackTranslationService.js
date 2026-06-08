const CHUNK_SIZE = 4500;
const BATCH_SIZE = 2;

function normalizeLang(code) {
  const map = {
    'pt-BR': 'pt',
    zh: 'zh-CN',
    auto: 'auto',
  };
  return map[code] || code.split('-')[0];
}

async function translateWithGoogle(text, sourceLang, targetLang) {
  const sl = sourceLang === 'auto' ? 'auto' : normalizeLang(sourceLang);
  const tl = normalizeLang(targetLang);
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    throw new Error(`Google Translate no disponible (${res.status})`);
  }

  const data = await res.json();
  const translated = data?.[0]?.map((part) => part?.[0]).join('') || '';
  if (!translated.trim()) {
    throw new Error('Google Translate devolvio respuesta vacia');
  }
  return translated;
}

async function translateWithMyMemory(text, sourceLang, targetLang) {
  const source = sourceLang === 'auto' ? 'autodetect' : normalizeLang(sourceLang);
  const target = normalizeLang(targetLang);
  const langpair = `${source}|${target}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langpair)}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) {
    throw new Error(`MyMemory no disponible (${res.status})`);
  }

  const data = await res.json();
  if (data.responseStatus !== 200) {
    throw new Error(data.responseDetails || 'MyMemory rechazo la solicitud');
  }

  return data.responseData?.translatedText || text;
}

async function translateChunk(text, sourceLang, targetLang) {
  const errors = [];
  for (const fn of [translateWithGoogle, translateWithMyMemory]) {
    try {
      return await fn(text, sourceLang, targetLang);
    } catch (err) {
      errors.push(err.message);
    }
  }
  throw new Error(errors.join(' | ') || 'Sin servicios de traduccion gratuitos');
}

export async function translateWithFallback(text, targetLang, sourceLang = 'auto') {
  if (!text.trim()) return text;

  const chunks = [];
  for (let i = 0; i < text.length; i += CHUNK_SIZE) {
    chunks.push(text.slice(i, i + CHUNK_SIZE));
  }

  const translated = [];
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE).filter((c) => c.trim());
    const results = await Promise.all(
      batch.map((chunk) => translateChunk(chunk, sourceLang, targetLang))
    );
    translated.push(...results);
    if (i + BATCH_SIZE < chunks.length) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  return translated.join('');
}

export function isFallbackAvailable() {
  return true;
}

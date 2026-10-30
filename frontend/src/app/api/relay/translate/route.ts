import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const PIECE_SIZE = 1500;

function normalizeLang(code: string) {
  const map: Record<string, string> = { 'pt-BR': 'pt', zh: 'zh-CN', auto: 'auto' };
  return map[code] || code.split('-')[0];
}

function splitText(text: string) {
  const pieces: string[] = [];
  let rest = text;
  while (rest.length > PIECE_SIZE) {
    let cut = rest.lastIndexOf('\n', PIECE_SIZE);
    if (cut < PIECE_SIZE / 2) cut = rest.lastIndexOf('. ', PIECE_SIZE) + 1;
    if (cut < PIECE_SIZE / 2) cut = rest.lastIndexOf(' ', PIECE_SIZE);
    if (cut <= 0) cut = PIECE_SIZE;
    pieces.push(rest.slice(0, cut));
    rest = rest.slice(cut);
  }
  if (rest) pieces.push(rest);
  return pieces;
}

async function google(text: string, source: string, target: string) {
  const sl = source === 'auto' ? 'auto' : normalizeLang(source);
  const tl = normalizeLang(target);
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`Google ${res.status}`);
  const data = await res.json();
  const out = (data?.[0] || []).map((part: unknown[]) => part?.[0] ?? '').join('');
  if (!out.trim()) throw new Error('Google vacio');
  return out;
}

async function myMemory(text: string, source: string, target: string) {
  const langpair = `${source === 'auto' ? 'autodetect' : normalizeLang(source)}|${normalizeLang(target)}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langpair)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`MyMemory ${res.status}`);
  const data = await res.json();
  if (data.responseStatus !== 200) throw new Error(data.responseDetails || 'MyMemory rechazo');
  return data.responseData?.translatedText as string;
}

async function translatePiece(text: string, source: string, target: string) {
  if (!text.trim()) return { text, provider: 'none' };
  const lead = text.match(/^\s*/)?.[0] ?? '';
  const trail = text.match(/\s*$/)?.[0] ?? '';
  const errors: string[] = [];
  for (const [name, fn] of [['google', google], ['mymemory', myMemory]] as const) {
    try {
      const out = await fn(text.trim(), source, target);
      return { text: lead + out.trim() + trail, provider: name };
    } catch (err) {
      errors.push((err as Error).message);
    }
  }
  throw new Error(errors.join(' | '));
}

export async function POST(request: NextRequest) {
  const secret = process.env.RELAY_SECRET;
  if (!secret || request.headers.get('x-relay-key') !== secret) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { text, source = 'auto', target } = await request.json();
  if (typeof text !== 'string' || !target) {
    return NextResponse.json({ error: 'text y target son requeridos' }, { status: 400 });
  }

  try {
    const results = [];
    for (const piece of splitText(text)) {
      results.push(await translatePiece(piece, source, target));
    }
    return NextResponse.json({
      text: results.map((r) => r.text).join(''),
      provider: results.find((r) => r.provider !== 'none')?.provider || 'none',
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}

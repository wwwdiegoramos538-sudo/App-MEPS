import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const ENDPOINT = 'https://text.pollinations.ai/openai';

export async function POST(request: NextRequest) {
  const secret = process.env.RELAY_SECRET;
  if (!secret || request.headers.get('x-relay-key') !== secret) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { messages, temperature = 0.5 } = await request.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'messages es requerido' }, { status: 400 });
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'openai', messages, temperature, private: true }),
      signal: AbortSignal.timeout(40000),
    });
    if (!res.ok) {
      return NextResponse.json({ error: `IA no disponible (${res.status})` }, { status: res.status === 402 ? 429 : 502 });
    }
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content?.trim();
    if (!content) return NextResponse.json({ error: 'IA devolvio respuesta vacia' }, { status: 502 });
    return NextResponse.json({ content });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}

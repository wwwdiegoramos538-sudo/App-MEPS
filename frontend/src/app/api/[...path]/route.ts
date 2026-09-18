import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-encoding',
  'content-length',
]);

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const backend = (process.env.BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');
  const target = `${backend}/api/${path.join('/')}${request.nextUrl.search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) headers.set(key, value);
  });

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'manual',
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.arrayBuffer();
  }

  try {
    const res = await fetch(target, init);
    const out = new Headers();
    res.headers.forEach((value, key) => {
      if (!HOP_BY_HOP.has(key.toLowerCase())) out.set(key, value);
    });
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: out });
  } catch {
    return Response.json(
      { error: 'Servidor ocupado. Reintenta en unos segundos.' },
      { status: 503 }
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;

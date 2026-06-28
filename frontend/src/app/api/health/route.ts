import { NextResponse } from 'next/server';

export async function GET() {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
  let backend = 'unknown';

  try {
    const res = await fetch(`${backendUrl}/api/health`, {
      signal: AbortSignal.timeout(30000),
    });
    backend = res.ok ? 'ok' : `error-${res.status}`;
  } catch {
    backend = 'unreachable';
  }

  return NextResponse.json({
    status: 'ok',
    service: 'MEPS Frontend',
    backend,
    timestamp: new Date().toISOString(),
  });
}

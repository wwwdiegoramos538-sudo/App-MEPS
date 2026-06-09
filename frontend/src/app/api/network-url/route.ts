import { networkInterfaces } from 'os';
import { NextResponse } from 'next/server';

function getLocalIp(): string | null {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
}

export async function GET(request: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || 'http';

  const isPublicHost =
    Boolean(appUrl) ||
    host?.includes('onrender.com') ||
    host?.includes('vercel.app') ||
    proto === 'https';

  if (isPublicHost && host) {
    const base = appUrl || `${proto}://${host.split(',')[0].trim()}`;
    return NextResponse.json({
      frontendUrl: base,
      apiUrl: `${base}/api`,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=10&data=${encodeURIComponent(base)}`,
      hint: 'Abre este enlace en tu celular (internet o datos moviles).',
    });
  }

  const port = process.env.PORT || '3000';
  const ip = getLocalIp();
  const hostOnly = host?.split(':')[0];
  const lanIp = ip || (hostOnly && hostOnly !== 'localhost' ? hostOnly : null);
  const frontendUrl = lanIp ? `http://${lanIp}:${port}` : `http://localhost:${port}`;

  return NextResponse.json({
    frontendUrl,
    apiUrl: `${frontendUrl}/api`,
    qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=10&data=${encodeURIComponent(frontendUrl)}`,
    hint: 'PC y celular deben estar en la misma red Wi-Fi.',
  });
}

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
  const port = process.env.PORT || '3000';
  const ip = getLocalIp();
  const host = request.headers.get('host')?.split(':')[0];
  const lanIp = ip || (host && host !== 'localhost' ? host : null);

  const frontendUrl = lanIp ? `http://${lanIp}:${port}` : `http://localhost:${port}`;
  const apiUrl = lanIp ? `http://${lanIp}:${port}/api` : `http://localhost:${port}/api`;

  return NextResponse.json({
    frontendUrl,
    apiUrl,
    qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=10&data=${encodeURIComponent(frontendUrl)}`,
    hint: 'PC y celular deben estar en la misma red Wi-Fi.',
  });
}

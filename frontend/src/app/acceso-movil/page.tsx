'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OutlineIcon } from '@/components/icons/OutlineIcon';

type NetworkInfo = {
  frontendUrl: string;
  apiUrl: string;
  qrUrl: string;
  hint: string;
};

export default function AccesoMovilPage() {
  const [info, setInfo] = useState<NetworkInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    fetch('/api/network-url')
      .then((r) => r.json())
      .then(setInfo)
      .catch(() =>
        setInfo({
          frontendUrl: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
          apiUrl: '/api',
          qrUrl: '',
          hint: 'No se pudo detectar la IP local.',
        })
      );
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const copyUrl = async () => {
    if (!info?.frontendUrl) return;
    await navigator.clipboard.writeText(info.frontendUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const installApp = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const qrSrc =
    info?.qrUrl ||
    (info?.frontendUrl
      ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=10&data=${encodeURIComponent(info.frontendUrl)}`
      : '');

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <div className="page-container pt-20 sm:pt-24 pb-16">
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 border-black bg-meps-cyan/30 text-sm font-semibold mb-4">
              <OutlineIcon name="upload" size={16} />
              Acceso movil
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">
              Usa MEPS en tu <span className="text-gradient">celular</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              Escanea el codigo QR o abre el enlace en el navegador de tu telefono. Misma red Wi-Fi que esta PC.
            </p>
          </div>

          <Card variant="elevated" className="text-center">
            {qrSrc ? (
              <div className="inline-block p-4 bg-white rounded-2xl border-2 border-black shadow-brutal mx-auto mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrSrc} alt="QR para abrir MEPS en el celular" width={280} height={280} className="rounded-lg" />
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-gray-400">Generando QR...</div>
            )}

            {info?.frontendUrl && (
              <div className="space-y-3">
                <p className="font-mono text-sm sm:text-base break-all bg-meps-sky/40 dark:bg-gray-800 px-4 py-3 rounded-xl border border-black/20">
                  {info.frontendUrl}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button onClick={copyUrl} variant="outline" className="w-full sm:w-auto">
                    {copied ? 'Copiado' : 'Copiar enlace'}
                  </Button>
                  <a href={info.frontendUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <Button className="w-full">Abrir enlace</Button>
                  </a>
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-4">{info?.hint}</p>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card variant="soft">
              <OutlineIcon name="check" size={24} className="mb-3" />
              <h2 className="font-bold mb-2">1. Misma Wi-Fi</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Conecta el celular a la misma red que esta computadora. El servidor debe estar corriendo con{' '}
                <code className="text-xs bg-meps-sky/50 px-1 rounded">npm run dev</code>.
              </p>
            </Card>
            <Card variant="soft">
              <OutlineIcon name="download" size={24} className="mb-3" />
              <h2 className="font-bold mb-2">2. Escanear QR</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Abre la camara o Chrome en Android y escanea el codigo. Se abrira MEPS en el navegador.
              </p>
            </Card>
            <Card variant="soft">
              <OutlineIcon name="sparkles" size={24} className="mb-3" />
              <h2 className="font-bold mb-2">3. Instalar en pantalla</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Android Chrome: menu ⋮ → &quot;Instalar aplicacion&quot; o &quot;Anadir a pantalla de inicio&quot;. iPhone Safari:
                Compartir → &quot;Anadir a inicio&quot;.
              </p>
              {deferredPrompt && (
                <Button size="sm" onClick={installApp} className="w-full">
                  Instalar MEPS
                </Button>
              )}
            </Card>
            <Card variant="soft">
              <OutlineIcon name="settings" size={24} className="mb-3" />
              <h2 className="font-bold mb-2">API en movil</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Usa la URL del QR (puerto 3000). La API va por proxy <code className="text-xs">/api</code>. No uses{' '}
                <code className="text-xs">localhost:4000</code> en el celular.
              </p>
            </Card>
          </div>

          <Card className="bg-meps-sky/30 dark:bg-meps-dark/20">
            <h2 className="font-bold mb-2">Produccion (internet publico)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Para compartir fuera de tu red, despliega en Vercel, Railway o un VPS y genera un QR con la URL publica
              (por ejemplo <code className="text-xs">https://tu-dominio.com</code>).
            </p>
          </Card>

          <div className="text-center">
            <Link href="/">
              <Button variant="outline">Volver al inicio</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';
import { ThemeScript } from '@/components/ThemeScript';
import { IntroBlockScript } from '@/components/IntroBlockScript';
import { ClientShell } from '@/components/ClientShell';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MEPS',
  },
  title: {
    default: 'MEPS - Traduciendo el Futuro | Traduccion con IA',
    template: '%s | MEPS',
  },
  description:
    'Plataforma SaaS profesional para traducir documentos, libros, revistas, manuales y audiolibros a mas de 50 idiomas con inteligencia artificial.',
  keywords: ['traduccion', 'IA', 'documentos', 'PDF', 'audiolibros', 'MEPS', 'DeepL', 'OpenAI'],
  authors: [{ name: 'MEPS' }],
  openGraph: {
    title: 'MEPS - Traduciendo el Futuro',
    description: 'Traduce documentos y crea audiolibros con IA en mas de 50 idiomas',
    type: 'website',
    locale: 'es_ES',
    siteName: 'MEPS',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0033CC' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a1a' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <IntroBlockScript />
      </head>
      <body className="font-sans" suppressHydrationWarning>
        <ThemeScript />
        <div id="meps-static-splash" aria-hidden="true">
          <div className="meps-static-splash-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" width={120} height={120} className="meps-static-logo" />
            <p className="meps-static-title">MEPS</p>
            <p className="meps-static-sub">Cargando...</p>
            <div className="meps-static-bar">
              <div className="meps-static-bar-fill" />
            </div>
          </div>
        </div>
        <ClientShell>
          <Providers>{children}</Providers>
        </ClientShell>
      </body>
    </html>
  );
}

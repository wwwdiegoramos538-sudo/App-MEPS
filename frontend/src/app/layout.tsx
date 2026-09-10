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
    default: 'MEPS - Traduciendo el Futuro',
    template: '%s | MEPS',
  },
  description:
    'Traduce documentos, libros y manuales a mas de 50 idiomas. Audiolibros, editor de portadas y biblioteca personal.',
  keywords: ['traduccion', 'documentos', 'PDF', 'DOCX', 'audiolibros', 'MEPS', 'idiomas'],
  authors: [{ name: 'MEPS' }],
  openGraph: {
    title: 'MEPS - Traduciendo el Futuro',
    description: 'Traduce documentos y crea audiolibros en mas de 50 idiomas',
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

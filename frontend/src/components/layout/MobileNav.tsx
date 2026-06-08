'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { OutlineIcon } from '@/components/icons/OutlineIcon';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: 'dashboard', label: 'Inicio' },
  { href: '/dashboard/translate', icon: 'languages', label: 'Traducir' },
  { href: '/dashboard/documents', icon: 'file', label: 'Docs' },
  { href: '/dashboard/history', icon: 'history', label: 'Historial' },
  { href: '/dashboard/settings', icon: 'settings', label: 'Ajustes' },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t-2 border-black bg-white/95 dark:bg-gray-950/95 backdrop-blur-md safe-area-pb shadow-[0_-4px_20px_rgba(0,51,204,0.08)]">
        <div className="flex justify-around py-1.5 max-w-lg mx-auto">
          {navItems.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'touch-target flex flex-col items-center justify-center gap-0.5 px-2 py-1 text-[10px] sm:text-xs font-medium rounded-lg',
                pathname === item.href
                  ? 'text-meps-primary dark:text-meps-cyan bg-meps-sky/50 dark:bg-meps-dark/30'
                  : 'text-gray-600 dark:text-gray-400'
              )}
            >
              <OutlineIcon name={item.icon as 'dashboard'} size={20} />
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="touch-target flex flex-col items-center justify-center gap-0.5 px-2 py-1 text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400"
          >
            <OutlineIcon name="menu" size={20} />
            Mas
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="absolute right-0 top-0 bottom-0 w-[min(100%,20rem)] bg-white dark:bg-gray-950 border-l-2 border-black p-4 overflow-y-auto safe-area-pb shadow-soft-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <Logo size="sm" showText={false} href="/dashboard" />
              <button type="button" onClick={() => setOpen(false)} className="touch-target p-2" aria-label="Cerrar">
                <OutlineIcon name="close" />
              </button>
            </div>
            <nav className="space-y-1">
              {[
                ...navItems,
                { href: '/dashboard/library', icon: 'library', label: 'Biblioteca' },
                { href: '/dashboard/audiobooks', icon: 'headphones', label: 'Audiolibros' },
                { href: '/dashboard/designs', icon: 'palette', label: 'Editor portadas' },
                { href: '/dashboard/subscription', icon: 'credit', label: 'Suscripcion' },
                { href: '/dashboard/support', icon: 'message', label: 'Soporte' },
                { href: '/acceso-movil', icon: 'upload', label: 'Abrir en celular' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm',
                    pathname === item.href
                      ? 'bg-meps-dark text-white border-2 border-black shadow-brutal-sm'
                      : 'hover:bg-meps-sky/40 dark:hover:bg-gray-800'
                  )}
                >
                  <OutlineIcon name={item.icon as 'dashboard'} size={18} />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-6 pt-4 border-t-2 border-black/10 space-y-1">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-xl hover:bg-meps-sky/40 dark:hover:bg-gray-800 text-sm font-medium"
              >
                <OutlineIcon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
                {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium"
              >
                <OutlineIcon name="logout" size={18} />
                Cerrar sesion
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

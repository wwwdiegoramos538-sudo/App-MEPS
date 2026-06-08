'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { OutlineIcon } from '@/components/icons/OutlineIcon';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const links = [
    { href: '#features', label: 'Funciones' },
    { href: '#pricing', label: 'Precios' },
    { href: '#how-it-works', label: 'Como funciona' },
    { href: '/acceso-movil', label: 'Celular', isRoute: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b-2 border-black bg-white/95 dark:bg-gray-950/95 backdrop-blur-md shadow-sm">
      <div className="page-container">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Logo size="sm" />

          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {links.map((l) =>
              l.isRoute ? (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm font-medium hover:text-meps-primary dark:hover:text-meps-cyan transition-colors"
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-sm font-medium hover:text-meps-primary dark:hover:text-meps-cyan transition-colors"
                >
                  {l.label}
                </a>
              )
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="touch-target p-2 rounded-lg hover:bg-meps-sky/50 dark:hover:bg-gray-800"
              aria-label="Cambiar tema"
            >
              <OutlineIcon name={theme === 'dark' ? 'sun' : 'moon'} />
            </button>
            {user ? (
              <Link href="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Iniciar sesion
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Comenzar gratis</Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex md:hidden items-center gap-1">
            <button
              type="button"
              onClick={toggleTheme}
              className="touch-target p-2"
              aria-label="Cambiar tema"
            >
              <OutlineIcon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />
            </button>
            <button
              type="button"
              className="touch-target p-2"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              <OutlineIcon name={open ? 'close' : 'menu'} size={22} />
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden py-4 border-t-2 border-black/10 space-y-2 animate-fade-in pb-4">
            {links.map((l) =>
              l.isRoute ? (
                <Link
                  key={l.href}
                  href={l.href}
                  className="block py-2.5 px-2 font-medium rounded-lg hover:bg-meps-sky/40"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.href}
                  href={l.href}
                  className="block py-2.5 px-2 font-medium rounded-lg hover:bg-meps-sky/40"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </a>
              )
            )}
            <div className="flex flex-col sm:flex-row gap-2 pt-3">
              <Link href="/login" className="flex-1" onClick={() => setOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  Iniciar sesion
                </Button>
              </Link>
              <Link href="/register" className="flex-1" onClick={() => setOpen(false)}>
                <Button size="sm" className="w-full">
                  Registrarse
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

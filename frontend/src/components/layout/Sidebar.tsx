'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { OutlineIcon } from '@/components/icons/OutlineIcon';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/dashboard/translate', icon: 'languages', label: 'Traducir' },
  { href: '/dashboard/documents', icon: 'file', label: 'Documentos' },
  { href: '/dashboard/history', icon: 'history', label: 'Historial' },
  { href: '/dashboard/library', icon: 'library', label: 'Biblioteca' },
  { href: '/dashboard/audiobooks', icon: 'headphones', label: 'Audiolibros' },
  { href: '/dashboard/designs', icon: 'palette', label: 'Editor portadas' },
  { href: '/dashboard/subscription', icon: 'credit', label: 'Suscripcion' },
  { href: '/dashboard/support', icon: 'message', label: 'Soporte' },
  { href: '/dashboard/settings', icon: 'settings', label: 'Configuracion' },
  { href: '/acceso-movil', icon: 'upload', label: 'Abrir en celular' },
];

const adminItems = [
  { href: '/admin', icon: 'shield', label: 'Panel Admin' },
  { href: '/admin/users', icon: 'users', label: 'Usuarios' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r-2 border-black bg-white/98 dark:bg-gray-950 fixed left-0 top-0 z-40 shadow-soft">
      <div className="p-4 border-b-2 border-black">
        <Logo size="sm" href="/dashboard" />
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all',
              pathname === item.href
                ? 'bg-meps-dark text-white border-2 border-black shadow-[2px_2px_0_#00D4FF]'
                : 'hover:bg-meps-light/30 dark:hover:bg-gray-800'
            )}
          >
            <OutlineIcon name={item.icon as 'dashboard'} size={18} />
            {item.label}
          </Link>
        ))}

        {user?.role === 'ADMIN' && (
          <>
            <div className="pt-4 pb-2 px-3 text-xs font-bold text-gray-500 uppercase">Admin</div>
            {adminItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm',
                  pathname.startsWith(item.href) && 'bg-red-600 text-white border-2 border-black'
                )}
              >
                <OutlineIcon name={item.icon as 'shield'} size={18} />
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="p-3 border-t-2 border-black space-y-2">
        <button onClick={toggleTheme} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <OutlineIcon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
          <span className="text-sm font-medium">{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
        </button>
        <button onClick={logout} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600">
          <OutlineIcon name="logout" size={18} />
          <span className="text-sm font-medium">Cerrar sesion</span>
        </button>
      </div>
    </aside>
  );
}

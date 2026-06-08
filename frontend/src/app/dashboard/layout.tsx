'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--background)]">
        <Sidebar />
        <main className="lg:ml-64 min-h-screen">
          <header className="sticky top-0 z-30 border-b-2 border-black bg-white/95 dark:bg-gray-950/95 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-display font-bold text-base sm:text-lg truncate">
                  Hola, {user?.name?.split(' ')[0]}
                </h2>
                <p className="text-xs text-gray-500 truncate">
                  Plan {user?.subscription?.plan || 'FREE'} · {user?.subscription?.translationsUsed || 0}/
                  {user?.subscription?.translationsLimit === -1
                    ? 'Ilimitado'
                    : user?.subscription?.translationsLimit || 5}{' '}
                  traducciones
                </p>
              </div>
            </div>
          </header>
          <div className="p-4 sm:p-6 pb-28 lg:pb-6 max-w-6xl mx-auto w-full">{children}</div>
        </main>
        <MobileNav />
      </div>
    </ProtectedRoute>
  );
}

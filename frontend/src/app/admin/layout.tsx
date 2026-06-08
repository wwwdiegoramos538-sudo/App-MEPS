'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen bg-[var(--background)]">
        <Sidebar />
        <main className="lg:ml-64 min-h-screen p-6 pb-24 lg:pb-6">
          <div className="mb-6 px-2 py-3 rounded-lg bg-red-600 text-white border-2 border-black font-bold text-sm">
            Panel de Administracion MEPS
          </div>
          {children}
        </main>
        <MobileNav />
      </div>
    </ProtectedRoute>
  );
}

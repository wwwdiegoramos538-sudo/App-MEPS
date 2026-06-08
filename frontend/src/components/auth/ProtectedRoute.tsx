'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { isAuthenticated } from '@/lib/auth';

export function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated()) {
        router.replace('/login');
      } else if (adminOnly && user?.role !== 'ADMIN') {
        router.replace('/dashboard');
      }
    }
  }, [loading, user, adminOnly, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-meps-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated() || (adminOnly && user?.role !== 'ADMIN')) {
    return null;
  }

  return <>{children}</>;
}

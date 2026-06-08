'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OutlineIcon } from '@/components/icons/OutlineIcon';
import { userApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ translations: 0, documents: 0, audiobooks: 0, designs: 0 });

  useEffect(() => {
    userApi.getStats().then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  const cards = [
    { icon: 'languages', label: 'Traducciones', value: stats.translations, href: '/dashboard/translate', color: 'bg-meps-cyan/20' },
    { icon: 'file', label: 'Documentos', value: stats.documents, href: '/dashboard/documents', color: 'bg-meps-light/30' },
    { icon: 'headphones', label: 'Audiolibros', value: stats.audiobooks, href: '/dashboard/audiobooks', color: 'bg-purple-100 dark:bg-purple-900/30' },
    { icon: 'palette', label: 'Disenos', value: stats.designs, href: '/dashboard/designs', color: 'bg-orange-100 dark:bg-orange-900/30' },
  ];

  const quickActions = [
    { icon: 'upload', label: 'Nueva traduccion', href: '/dashboard/translate' },
    { icon: 'headphones', label: 'Crear audiolibro', href: '/dashboard/audiobooks' },
    { icon: 'palette', label: 'Disenar portada', href: '/dashboard/designs' },
    { icon: 'library', label: 'Mi biblioteca', href: '/dashboard/library' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm sm:text-base">Bienvenido a MEPS - Traduciendo el Futuro</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}>
            <Card hover variant="soft" className={c.color}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{c.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">{c.value}</p>
                </div>
                <OutlineIcon name={c.icon as 'languages'} size={28} />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <h2 className="font-bold text-lg mb-4">Acciones rapidas</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((a) => (
            <Link key={a.label} href={a.href}>
              <button className="w-full flex items-center gap-3 p-4 rounded-lg border-2 border-black hover:bg-meps-light/20 transition-all">
                <OutlineIcon name={a.icon as 'upload'} />
                <span className="font-medium text-sm">{a.label}</span>
              </button>
            </Link>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Uso del plan</h2>
          <Link href="/dashboard/subscription">
            <Button variant="outline" size="sm">Actualizar plan</Button>
          </Link>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 border-2 border-black overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-meps-dark to-meps-cyan transition-all"
            style={{
              width: `${Math.min(
                100,
                ((user?.subscription?.translationsUsed || 0) /
                  (user?.subscription?.translationsLimit || 5)) *
                  100
              )}%`,
            }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {user?.subscription?.translationsUsed || 0} de{' '}
          {user?.subscription?.translationsLimit === -1 ? 'ilimitadas' : user?.subscription?.translationsLimit || 5}{' '}
          traducciones usadas este mes
        </p>
      </Card>
    </div>
  );
}

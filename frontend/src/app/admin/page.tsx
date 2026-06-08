'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { OutlineIcon } from '@/components/icons/OutlineIcon';
import { adminApi } from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, translations: 0, documents: 0, payments: 0, revenue: 0 });

  useEffect(() => {
    adminApi.getDashboard().then(({ data }) => setStats(data.stats));
  }, []);

  const cards = [
    { icon: 'users', label: 'Usuarios', value: stats.users },
    { icon: 'languages', label: 'Traducciones', value: stats.translations },
    { icon: 'file', label: 'Documentos', value: stats.documents },
    { icon: 'credit', label: 'Pagos', value: stats.payments },
    { icon: 'chart', label: 'Ingresos ($)', value: stats.revenue.toFixed(2) },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-3xl font-bold">Panel Administrador</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <OutlineIcon name={c.icon as 'users'} className="mb-3" />
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="text-2xl font-bold">{c.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

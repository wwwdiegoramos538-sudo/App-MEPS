'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  subscription?: { plan: string };
  _count?: { translations: number; documents: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');

  const load = (q?: string) => {
    adminApi.getUsers({ search: q }).then(({ data }) => setUsers(data.users));
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (user: AdminUser) => {
    await adminApi.updateUser(user.id, { isActive: !user.isActive });
    load(search);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-3xl font-bold">Gestion de usuarios</h1>

      <div className="flex gap-4">
        <Input placeholder="Buscar por email o nombre..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />
        <Button onClick={() => load(search)}>Buscar</Button>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <Card key={user.id} className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{user.name} <span className="text-xs text-gray-500">({user.role})</span></p>
              <p className="text-sm text-gray-500">{user.email} - Plan {user.subscription?.plan || 'FREE'}</p>
              <p className="text-xs text-gray-400">
                {user._count?.translations || 0} traducciones - Registrado {formatDate(user.createdAt)}
              </p>
            </div>
            <Button variant={user.isActive ? 'danger' : 'secondary'} size="sm" onClick={() => toggleActive(user)}>
              {user.isActive ? 'Desactivar' : 'Activar'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

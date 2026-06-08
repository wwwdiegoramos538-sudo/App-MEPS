'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { userApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProfile = async () => {
    setLoading(true);
    try {
      await userApi.updateProfile({ name });
      await refreshUser();
      setMessage('Perfil actualizado');
    } finally {
      setLoading(false);
    }
  };

  const handlePassword = async () => {
    setLoading(true);
    try {
      await userApi.updatePassword(currentPassword, newPassword);
      setMessage('Contrasena actualizada');
      setCurrentPassword('');
      setNewPassword('');
    } catch {
      setMessage('Error al actualizar contrasena');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6 animate-fade-in">
      <h1 className="font-display text-3xl font-bold">Configuracion</h1>
      {message && <p className="text-green-600 text-sm">{message}</p>}

      <Card>
        <h2 className="font-bold mb-4">Perfil</h2>
        <div className="space-y-4">
          <Input label="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" value={user?.email || ''} disabled />
          <Button onClick={handleProfile} loading={loading}>Guardar cambios</Button>
        </div>
      </Card>

      <Card>
        <h2 className="font-bold mb-4">Cambiar contrasena</h2>
        <div className="space-y-4">
          <Input label="Contrasena actual" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          <Input label="Nueva contrasena" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <Button onClick={handlePassword} loading={loading}>Actualizar contrasena</Button>
        </div>
      </Card>
    </div>
  );
}

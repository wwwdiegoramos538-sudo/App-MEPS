'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { authApi } from '@/lib/api';
import { saveAuth } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { getApiErrorMessage } from '@/lib/errors';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('La contrasena debe tener al menos 8 caracteres');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.register({ name, email, password });
      saveAuth(data.token, data.user);
      setUser(data.user);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Error al registrarse'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-meps-light/30 to-white dark:from-gray-950 dark:to-gray-900">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="md" href="/" className="justify-center" />
          <h1 className="font-display text-2xl font-bold mt-4">Crear cuenta</h1>
          <p className="text-gray-500 text-sm mt-1">5 traducciones gratis al mes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Correo electronico" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Contrasena (min. 8 caracteres)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>Crear cuenta gratis</Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Ya tienes cuenta?{' '}
          <Link href="/login" className="font-semibold text-meps-dark dark:text-meps-cyan hover:underline">
            Iniciar sesion
          </Link>
        </p>
      </Card>
    </div>
  );
}

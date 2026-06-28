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
import { wakeBackend, loginWithRetry } from '@/lib/wakeBackend';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('');
    setLoading(true);
    try {
      await wakeBackend(setStatus);
      const { data } = await loginWithRetry(
        () => authApi.login({ email, password }),
        setStatus
      );
      saveAuth(data.token, data.user);
      setUser(data.user);
      setStatus('');
      router.push(data.user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Error al iniciar sesion'));
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-meps-sky via-white to-meps-cream dark:from-gray-950 dark:to-gray-900"
    >
      <Card variant="elevated" className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="md" href="/" className="justify-center" />
          <h1 className="font-display text-2xl font-bold mt-4">Iniciar sesion</h1>
          <p className="text-gray-500 text-sm mt-1">Accede a tu cuenta MEPS</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Correo electronico" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Contrasena (opcional)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Cualquier contrasena" />
          {status && <p className="text-meps-dark dark:text-meps-cyan text-sm">{status}</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>
            {loading && status ? 'Conectando...' : 'Iniciar sesion'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm space-y-2">
          <Link href="/forgot-password" className="text-meps-dark dark:text-meps-cyan hover:underline">
            Olvidaste tu contrasena?
          </Link>
          <p className="text-gray-500">
            No tienes cuenta?{' '}
            <Link href="/register" className="font-semibold text-meps-dark dark:text-meps-cyan hover:underline">
              Registrate gratis
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

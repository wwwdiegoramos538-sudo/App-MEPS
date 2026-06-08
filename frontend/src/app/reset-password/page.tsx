'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { authApi } from '@/lib/api';

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Las contrasenas no coinciden');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Error al restablecer');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <p className="text-red-500 text-center">Token invalido</p>;
  }

  return success ? (
    <p className="text-center text-green-600">Contrasena actualizada. Redirigiendo...</p>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nueva contrasena" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <Input label="Confirmar contrasena" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" className="w-full" loading={loading}>Restablecer contrasena</Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="md" href="/" className="justify-center" />
          <h1 className="font-display text-2xl font-bold mt-4">Nueva contrasena</h1>
        </div>
        <Suspense fallback={<div className="text-center">Cargando...</div>}>
          <ResetForm />
        </Suspense>
        <Link href="/login" className="block text-center mt-6 text-sm hover:underline">Volver al login</Link>
      </Card>
    </div>
  );
}

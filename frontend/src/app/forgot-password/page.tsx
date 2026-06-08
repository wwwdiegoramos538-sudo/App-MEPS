'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { authApi } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="md" href="/" className="justify-center" />
          <h1 className="font-display text-2xl font-bold mt-4">Recuperar contrasena</h1>
        </div>

        {sent ? (
          <p className="text-center text-gray-600 dark:text-gray-400">
            Si el correo existe en nuestro sistema, recibiras instrucciones para restablecer tu contrasena.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Correo electronico" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Button type="submit" className="w-full" loading={loading}>Enviar enlace</Button>
          </form>
        )}

        <Link href="/login" className="block text-center mt-6 text-sm text-meps-dark dark:text-meps-cyan hover:underline">
          Volver al inicio de sesion
        </Link>
      </Card>
    </div>
  );
}

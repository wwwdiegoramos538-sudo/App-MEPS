'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OutlineIcon } from '@/components/icons/OutlineIcon';
import { subscriptionApi } from '@/lib/api';

interface Plan {
  id: string;
  name: string;
  price: number;
  translations: number;
  features: string[];
}

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [current, setCurrent] = useState<{ plan: string; translationsUsed: number; translationsLimit: number } | null>(null);
  const [loading, setLoading] = useState('');

  useEffect(() => {
    subscriptionApi.getPlans().then(({ data }) => setPlans(data.plans));
    subscriptionApi.getCurrent().then(({ data }) => setCurrent(data.subscription));
  }, []);

  const handleCheckout = async (planId: string) => {
    if (planId === 'FREE') return;
    setLoading(planId);
    try {
      const { data } = await subscriptionApi.checkout(planId.toLowerCase());
      if (data.url) window.location.href = data.url;
    } catch {
      alert('Stripe no configurado. Configura las variables STRIPE_* en el backend.');
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-3xl font-bold">Suscripcion</h1>

      {current && (
        <Card className="bg-meps-dark/10">
          <p className="font-semibold">Plan actual: <span className="text-meps-dark dark:text-meps-cyan">{current.plan}</span></p>
          <p className="text-sm text-gray-500 mt-1">
            {current.translationsUsed} / {current.translationsLimit === -1 ? 'Ilimitado' : current.translationsLimit} traducciones usadas
          </p>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} className={current?.plan === plan.id ? 'ring-2 ring-meps-cyan' : ''} hover>
            <h3 className="font-bold text-xl">{plan.name}</h3>
            <p className="text-3xl font-display font-bold my-3">
              ${plan.price}<span className="text-sm font-normal">/mes</span>
            </p>
            <ul className="space-y-2 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <OutlineIcon name="check" size={14} />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className="w-full"
              variant={current?.plan === plan.id ? 'outline' : 'primary'}
              disabled={current?.plan === plan.id || plan.id === 'FREE'}
              loading={loading === plan.id}
              onClick={() => handleCheckout(plan.id)}
            >
              {current?.plan === plan.id ? 'Plan actual' : plan.id === 'FREE' ? 'Gratis' : 'Suscribirse'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

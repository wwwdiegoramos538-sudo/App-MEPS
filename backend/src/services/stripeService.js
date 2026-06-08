import Stripe from 'stripe';
import { config } from '../config/index.js';
import { prisma } from '../config/database.js';

let stripe = null;

function getStripe() {
  if (!config.stripeSecretKey) return null;
  if (!stripe) stripe = new Stripe(config.stripeSecretKey);
  return stripe;
}

const PLAN_LIMITS = {
  FREE: 5,
  BASIC: 50,
  PRO: 500,
  ENTERPRISE: -1,
};

export async function createCheckoutSession(userId, email, plan) {
  const client = getStripe();
  if (!client) throw new Error('Stripe no configurado');

  const priceId = config.stripePrices[plan.toLowerCase()];
  if (!priceId) throw new Error('Plan no valido');

  let subscription = await prisma.subscription.findUnique({ where: { userId } });
  let customerId = subscription?.stripeCustomerId;

  if (!customerId) {
    const customer = await client.customers.create({ email, metadata: { userId } });
    customerId = customer.id;
    await prisma.subscription.upsert({
      where: { userId },
      create: { userId, stripeCustomerId: customerId },
      update: { stripeCustomerId: customerId },
    });
  }

  const session = await client.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${config.frontendUrl}/dashboard/subscription?success=true`,
    cancel_url: `${config.frontendUrl}/dashboard/subscription?cancelled=true`,
    metadata: { userId, plan },
  });

  return session;
}

export async function handleWebhook(rawBody, signature) {
  const client = getStripe();
  if (!client) throw new Error('Stripe no configurado');

  const event = client.webhooks.constructEvent(
    rawBody,
    signature,
    config.stripeWebhookSecret
  );

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const { userId, plan } = session.metadata;
      const planUpper = plan.toUpperCase();

      await prisma.subscription.update({
        where: { userId },
        data: {
          plan: planUpper,
          status: 'ACTIVE',
          stripeSubscriptionId: session.subscription,
          translationsLimit: PLAN_LIMITS[planUpper] || 50,
          translationsUsed: 0,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      await prisma.payment.create({
        data: {
          userId,
          amount: (session.amount_total || 0) / 100,
          currency: session.currency?.toUpperCase() || 'USD',
          status: 'COMPLETED',
          stripePaymentId: session.payment_intent,
          description: `Suscripcion ${planUpper}`,
        },
      });
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      const dbSub = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: sub.id },
      });
      if (dbSub) {
        await prisma.subscription.update({
          where: { id: dbSub.id },
          data: { plan: 'FREE', status: 'CANCELLED', translationsLimit: 5 },
        });
      }
      break;
    }
  }

  return { received: true };
}

export function getPlans() {
  return [
    {
      id: 'FREE',
      name: 'Gratis',
      price: 0,
      translations: 5,
      features: ['5 traducciones/mes', 'PDF, DOCX, TXT', '50+ idiomas'],
    },
    {
      id: 'BASIC',
      name: 'Basico',
      price: 9.99,
      translations: 50,
      features: ['50 traducciones/mes', 'Biblioteca personal', 'Soporte email'],
    },
    {
      id: 'PRO',
      name: 'Profesional',
      price: 29.99,
      translations: 500,
      features: ['500 traducciones/mes', 'Audiolibros IA', 'Editor de portadas', 'Soporte prioritario'],
    },
    {
      id: 'ENTERPRISE',
      name: 'Empresarial',
      price: 99.99,
      translations: -1,
      features: ['Traducciones ilimitadas', 'API dedicada', 'Almacenamiento cloud', 'Soporte 24/7'],
    },
  ];
}

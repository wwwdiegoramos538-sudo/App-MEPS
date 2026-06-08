import { Router } from 'express';
import { prisma } from '../config/database.js';
import { authenticate, attachUser } from '../middleware/auth.js';
import { createCheckoutSession, getPlans } from '../services/stripeService.js';

const router = Router();

router.get('/plans', (req, res) => {
  res.json({ plans: getPlans() });
});

router.use(authenticate, attachUser);

router.get('/current', async (req, res, next) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.userId },
    });
    res.json({ subscription });
  } catch (err) {
    next(err);
  }
});

router.post('/checkout', async (req, res, next) => {
  try {
    const { plan } = req.body;
    if (!['basic', 'pro', 'enterprise'].includes(plan?.toLowerCase())) {
      return res.status(400).json({ error: 'Plan no valido' });
    }

    const session = await createCheckoutSession(req.userId, req.user.email, plan);
    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    next(err);
  }
});

export default router;

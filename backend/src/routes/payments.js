import { Router } from 'express';
import { prisma } from '../config/database.js';
import { authenticate, attachUser } from '../middleware/auth.js';

const router = Router();
router.use(authenticate, attachUser);

router.get('/', async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ payments });
  } catch (err) {
    next(err);
  }
});

export default router;

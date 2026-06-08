import { Router } from 'express';
import { prisma } from '../config/database.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(authenticate, requireAdmin);

router.get('/dashboard', async (req, res, next) => {
  try {
    const [users, translations, documents, payments, revenue] = await Promise.all([
      prisma.user.count(),
      prisma.translation.count(),
      prisma.document.count(),
      prisma.payment.count({ where: { status: 'COMPLETED' } }),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    res.json({
      stats: {
        users,
        translations,
        documents,
        payments,
        revenue: revenue._sum.amount || 0,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          subscription: true,
          _count: { select: { translations: true, documents: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total });
  } catch (err) {
    next(err);
  }
});

router.put('/users/:id', async (req, res, next) => {
  try {
    const { isActive, role, plan } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(typeof isActive === 'boolean' && { isActive }),
        ...(role && { role }),
      },
    });

    if (plan) {
      await prisma.subscription.updateMany({
        where: { userId: req.params.id },
        data: { plan: plan.toUpperCase() },
      });
    }

    await prisma.adminLog.create({
      data: {
        adminId: req.userId,
        action: 'UPDATE_USER',
        target: req.params.id,
        details: { isActive, role, plan },
        ipAddress: req.ip,
      },
    });

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.get('/logs', async (req, res, next) => {
  try {
    const logs = await prisma.adminLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ logs });
  } catch (err) {
    next(err);
  }
});

router.get('/translations', async (req, res, next) => {
  try {
    const translations = await prisma.translation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { user: { select: { email: true, name: true } } },
    });
    res.json({ translations });
  } catch (err) {
    next(err);
  }
});

export default router;

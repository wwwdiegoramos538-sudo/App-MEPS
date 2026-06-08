import { Router } from 'express';
import { prisma } from '../config/database.js';
import { authenticate, attachUser } from '../middleware/auth.js';
import { chatSupport } from '../services/openaiService.js';

const router = Router();
router.use(authenticate, attachUser);

router.get('/', async (req, res, next) => {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
    res.json({ messages });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ error: 'Mensaje requerido' });
    }

    await prisma.chatMessage.create({
      data: { userId: req.userId, message, isSupport: false },
    });

    const history = await prisma.chatMessage.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const chatHistory = history
      .reverse()
      .filter((m) => m.isSupport)
      .flatMap((m) => [{ role: 'assistant', content: m.message }]);

    const reply = await chatSupport(message, chatHistory);

    const supportMsg = await prisma.chatMessage.create({
      data: { userId: req.userId, message: reply, isSupport: true },
    });

    res.json({ reply: supportMsg });
  } catch (err) {
    next(err);
  }
});

export default router;

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { prisma } from '../config/database.js';
import { authenticate, attachUser } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, attachUser);

router.get('/profile', (req, res) => {
  res.json({ user: req.user });
});

router.put(
  '/profile',
  [body('name').optional().trim().isLength({ min: 2 })],
  async (req, res, next) => {
    try {
      const { name, avatar } = req.body;
      const user = await prisma.user.update({
        where: { id: req.userId },
        data: { ...(name && { name }), ...(avatar && { avatar }) },
        select: { id: true, email: true, name: true, avatar: true, role: true },
      });
      res.json({ user });
    } catch (err) {
      next(err);
    }
  }
);

router.put('/password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'La nueva contrasena debe tener al menos 8 caracteres' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Contrasena actual incorrecta' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.userId }, data: { password: hashed } });
    res.json({ message: 'Contrasena actualizada' });
  } catch (err) {
    next(err);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const [translations, documents, audiobooks, designs] = await Promise.all([
      prisma.translation.count({ where: { userId: req.userId } }),
      prisma.document.count({ where: { userId: req.userId } }),
      prisma.audiobook.count({ where: { userId: req.userId } }),
      prisma.design.count({ where: { userId: req.userId } }),
    ]);

    res.json({
      translations,
      documents,
      audiobooks,
      designs,
      subscription: req.user.subscription,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

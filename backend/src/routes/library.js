import { Router } from 'express';
import { prisma } from '../config/database.js';
import { authenticate, attachUser } from '../middleware/auth.js';

const router = Router();
router.use(authenticate, attachUser);

router.get('/', async (req, res, next) => {
  try {
    const { category, favorite } = req.query;
    const items = await prisma.libraryItem.findMany({
      where: {
        userId: req.userId,
        ...(category && { category }),
        ...(favorite === 'true' && { isFavorite: true }),
      },
      orderBy: { createdAt: 'desc' },
      include: { document: true },
    });
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, documentId, category, tags } = req.body;
    const item = await prisma.libraryItem.create({
      data: {
        userId: req.userId,
        title,
        documentId,
        category: category || 'general',
        tags: tags || [],
      },
      include: { document: true },
    });
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/favorite', async (req, res, next) => {
  try {
    const item = await prisma.libraryItem.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) return res.status(404).json({ error: 'Item no encontrado' });

    const updated = await prisma.libraryItem.update({
      where: { id: item.id },
      data: { isFavorite: !item.isFavorite },
    });
    res.json({ item: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.libraryItem.deleteMany({
      where: { id: req.params.id, userId: req.userId },
    });
    res.json({ message: 'Eliminado de la biblioteca' });
  } catch (err) {
    next(err);
  }
});

export default router;

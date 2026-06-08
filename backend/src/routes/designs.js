import { Router } from 'express';
import { prisma } from '../config/database.js';
import { authenticate, attachUser } from '../middleware/auth.js';

const TEMPLATES = [
  { id: 'modern-1', name: 'Moderno Azul', preview: '/templates/modern-1.png' },
  { id: 'minimal-1', name: 'Minimalista', preview: '/templates/minimal-1.png' },
  { id: 'bold-1', name: 'Tipografia Bold', preview: '/templates/bold-1.png' },
  { id: 'gradient-1', name: 'Gradiente Futuro', preview: '/templates/gradient-1.png' },
  { id: 'classic-1', name: 'Clasico Editorial', preview: '/templates/classic-1.png' },
  { id: 'tech-1', name: 'Tech Digital', preview: '/templates/tech-1.png' },
];

const router = Router();

router.get('/templates', (req, res) => {
  res.json({ templates: TEMPLATES });
});

router.use(authenticate, attachUser);

router.get('/', async (req, res, next) => {
  try {
    const designs = await prisma.design.findMany({
      where: { userId: req.userId },
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ designs });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, type, template, content } = req.body;
    const design = await prisma.design.create({
      data: {
        userId: req.userId,
        title: title || 'Sin titulo',
        type: type || 'cover',
        template,
        content: content || {
          background: '#001FAD',
          title: 'Mi Libro',
          subtitle: 'Traduciendo el Futuro',
          fontFamily: 'Inter',
          titleColor: '#FFFFFF',
          elements: [],
        },
      },
    });
    res.status(201).json({ design });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const design = await prisma.design.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!design) return res.status(404).json({ error: 'Diseno no encontrado' });

    const updated = await prisma.design.update({
      where: { id: design.id },
      data: {
        ...(req.body.title && { title: req.body.title }),
        ...(req.body.content && { content: req.body.content }),
        ...(req.body.thumbnail && { thumbnail: req.body.thumbnail }),
      },
    });
    res.json({ design: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.design.deleteMany({
      where: { id: req.params.id, userId: req.userId },
    });
    res.json({ message: 'Diseno eliminado' });
  } catch (err) {
    next(err);
  }
});

export default router;

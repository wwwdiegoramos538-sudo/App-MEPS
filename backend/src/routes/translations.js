import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { body, validationResult } from 'express-validator';
import { prisma } from '../config/database.js';
import { authenticate, attachUser } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { startTranslation, checkTranslationLimit } from '../services/translationService.js';
import { LANGUAGES } from '../utils/languages.js';

const router = Router();

router.get('/languages', (req, res) => {
  res.json({ languages: LANGUAGES, count: LANGUAGES.length });
});

router.use(authenticate, attachUser);

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { userId: req.userId, ...(status && { status }) };

    const [translations, total] = await Promise.all([
      prisma.translation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        include: { document: { select: { title: true, originalName: true } } },
      }),
      prisma.translation.count({ where }),
    ]);

    res.json({ translations, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  upload.single('file'),
  [
    body('targetLanguage').notEmpty(),
    body('sourceLanguage').optional(),
    body('provider').optional().isIn(['auto', 'deepl', 'openai']),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Datos invalidos', details: errors.array() });
      }

      const limit = await checkTranslationLimit(req.userId);
      if (!limit.allowed) {
        return res.status(403).json({ error: limit.message });
      }

      const { targetLanguage, sourceLanguage = 'auto', provider = 'auto', documentId } = req.body;

      if (!req.file && !documentId) {
        return res.status(400).json({ error: 'Debes subir un archivo PDF, DOCX o TXT' });
      }

      const translation = await startTranslation({
        userId: req.userId,
        documentId: documentId || null,
        filePath: req.file?.path,
        mimeType: req.file?.mimetype,
        sourceLanguage,
        targetLanguage,
        provider,
      });

      res.status(202).json({ translation });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/:id', async (req, res, next) => {
  try {
    const translation = await prisma.translation.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { document: true },
    });
    if (!translation) return res.status(404).json({ error: 'Traduccion no encontrada' });
    res.json({ translation });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/download', async (req, res, next) => {
  try {
    const translation = await prisma.translation.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!translation || translation.status !== 'COMPLETED') {
      return res.status(404).json({ error: 'Traduccion no disponible' });
    }

    if (translation.translatedFile && fs.existsSync(translation.translatedFile)) {
      const ext = path.extname(translation.translatedFile).toLowerCase() || '.txt';
      const downloadName =
        ext === '.docx'
          ? `traduccion-${translation.targetLanguage}-${translation.id.slice(0, 8)}.docx`
          : `traduccion-${translation.id}.txt`;
      const contentType =
        ext === '.docx'
          ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          : 'text/plain; charset=utf-8';
      res.setHeader('Content-Type', contentType);
      return res.download(translation.translatedFile, downloadName);
    }

    if (translation.translatedText) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="traduccion-${translation.id}.txt"`);
      return res.send(translation.translatedText);
    }

    res.status(404).json({ error: 'Archivo no encontrado' });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const translation = await prisma.translation.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!translation) return res.status(404).json({ error: 'Traduccion no encontrada' });

    if (translation.translatedFile && fs.existsSync(translation.translatedFile)) {
      fs.unlinkSync(translation.translatedFile);
    }
    await prisma.translation.delete({ where: { id: translation.id } });
    res.json({ message: 'Traduccion eliminada' });
  } catch (err) {
    next(err);
  }
});

export default router;

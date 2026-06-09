import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../config/database.js';
import { authenticate, attachUser } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { getDocumentType } from '../services/fileParserService.js';
import { saveToStorage } from '../services/storageService.js';

const router = Router();
router.use(authenticate, attachUser);

router.get('/', async (req, res, next) => {
  try {
    const documents = await prisma.document.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: { translations: { select: { id: true, status: true, targetLanguage: true } } },
    });
    res.json({ documents });
  } catch (err) {
    next(err);
  }
});

router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibio ningun archivo' });
    }

    const stored = await saveToStorage(req.file.path, 'documents');
    const docType = getDocumentType(req.file.originalname);

    const document = await prisma.document.create({
      data: {
        userId: req.userId,
        title: req.body.title || req.file.originalname,
        originalName: req.file.originalname,
        fileName: req.file.filename,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        type: docType,
      },
    });

    await prisma.libraryItem.create({
      data: {
        userId: req.userId,
        documentId: document.id,
        title: document.title,
        category: 'documentos',
      },
    });

    res.status(201).json({ document, storage: stored });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const document = await prisma.document.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { translations: true },
    });
    if (!document) return res.status(404).json({ error: 'Documento no encontrado' });
    res.json({ document });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const document = await prisma.document.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!document) return res.status(404).json({ error: 'Documento no encontrado' });

    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }
    await prisma.document.delete({ where: { id: document.id } });
    res.json({ message: 'Documento eliminado' });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/download', async (req, res, next) => {
  try {
    const document = await prisma.document.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!document) return res.status(404).json({ error: 'Documento no encontrado' });
    res.download(document.filePath, document.originalName);
  } catch (err) {
    next(err);
  }
});

export default router;

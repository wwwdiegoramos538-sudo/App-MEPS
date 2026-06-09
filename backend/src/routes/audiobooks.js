import { Router } from 'express';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/database.js';
import { config } from '../config/index.js';
import { authenticate, attachUser } from '../middleware/auth.js';
import { generateAudiobookAudio } from '../services/openaiService.js';
import { canUseLocalTts, generateAudiobookAudioWav } from '../services/audioFallbackService.js';
import { sanitizeForDb } from '../utils/dbText.js';

const router = Router();
router.use(authenticate, attachUser);

router.get('/', async (req, res, next) => {
  try {
    const audiobooks = await prisma.audiobook.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ audiobooks });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, sourceText, language, voice = 'alloy' } = req.body;
    if (!sourceText?.trim()) {
      return res.status(400).json({ error: 'Texto requerido' });
    }

    const safeText = sanitizeForDb(sourceText);

    const audiobook = await prisma.audiobook.create({
      data: { userId: req.userId, title, sourceText: safeText, language, voice, status: 'processing' },
    });

    const hasOpenAI = !!config.openaiApiKey;
    if (!hasOpenAI && !canUseLocalTts()) {
      await prisma.audiobook.update({
        where: { id: audiobook.id },
        data: { status: 'failed' },
      });
      return res.status(503).json({
        error: 'Audiolibros requieren OPENAI_API_KEY en Render. Agrega la clave en meps-backend → Environment.',
        code: 'TTS_NOT_AVAILABLE',
      });
    }

    const audioExt = hasOpenAI ? 'mp3' : 'wav';
    const audioFileName = `${uuidv4()}.${audioExt}`;
    const audioPath = path.join(config.storageDir, 'audiobooks', audioFileName);

    try {
      if (hasOpenAI) {
        await generateAudiobookAudio(safeText, voice, audioPath);
      } else {
        await generateAudiobookAudioWav(safeText, voice, audioPath);
      }
      const updated = await prisma.audiobook.update({
        where: { id: audiobook.id },
        data: { audioPath, status: 'completed' },
      });
      res.status(201).json({ audiobook: updated });
    } catch (err) {
      await prisma.audiobook.update({
        where: { id: audiobook.id },
        data: { status: 'failed' },
      });
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

router.get('/:id/download', async (req, res, next) => {
  try {
    const audiobook = await prisma.audiobook.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!audiobook?.audioPath) {
      return res.status(404).json({ error: 'Audiolibro no disponible' });
    }
    const ext = path.extname(audiobook.audioPath) || '.mp3';
    res.download(audiobook.audioPath, `${audiobook.title}${ext}`);
  } catch (err) {
    next(err);
  }
});

export default router;

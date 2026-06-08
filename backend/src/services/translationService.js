import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/database.js';
import { config } from '../config/index.js';
import { extractTextFromFile } from './fileParserService.js';
import { translateWithDeepL, isDeepLAvailable } from './deeplService.js';
import { translateWithOpenAI, isOpenAIAvailable } from './openaiService.js';
import { translateWithFallback, isFallbackAvailable } from './fallbackTranslationService.js';
import { saveToStorage } from './storageService.js';
import { sanitizeForDb } from '../utils/dbText.js';

async function runTranslation(sourceText, targetLanguage, sourceLanguage, provider) {
  const errors = [];

  const tryDeepL = async () => {
    if (!(await isDeepLAvailable())) throw new Error('DeepL no configurada');
    return { text: await translateWithDeepL(sourceText, targetLanguage, sourceLanguage), provider: 'deepl' };
  };

  const tryOpenAI = async () => {
    if (!isOpenAIAvailable()) throw new Error('OpenAI no configurada');
    return { text: await translateWithOpenAI(sourceText, targetLanguage, sourceLanguage), provider: 'openai' };
  };

  const tryFallback = async () => {
    if (!isFallbackAvailable()) throw new Error('Sin servicios de traduccion');
    return { text: await translateWithFallback(sourceText, targetLanguage, sourceLanguage), provider: 'fallback' };
  };

  const chain =
    provider === 'deepl'
      ? [tryDeepL, tryOpenAI, tryFallback]
      : provider === 'openai'
        ? [tryOpenAI, tryDeepL, tryFallback]
        : [tryDeepL, tryOpenAI, tryFallback];

  for (const attempt of chain) {
    try {
      return await attempt();
    } catch (err) {
      errors.push(err.message);
    }
  }

  throw new Error(errors.join(' | ') || 'No hay motores de traduccion disponibles');
}

export async function startTranslation({
  userId,
  documentId,
  filePath,
  mimeType,
  sourceLanguage,
  targetLanguage,
  provider = 'auto',
}) {
  const translation = await prisma.translation.create({
    data: {
      userId,
      documentId,
      sourceLanguage,
      targetLanguage,
      provider: provider === 'auto' ? 'auto' : provider,
      status: 'PROCESSING',
      originalFile: filePath,
    },
  });

  processTranslationJob(translation.id, {
    userId,
    documentId,
    filePath,
    mimeType,
    sourceLanguage,
    targetLanguage,
    provider,
  }).catch((err) => {
    console.error(`[MEPS] Traduccion ${translation.id} fallida:`, err.message);
  });

  return translation;
}

async function processTranslationJob(translationId, {
  userId,
  documentId,
  filePath,
  mimeType,
  sourceLanguage,
  targetLanguage,
  provider = 'auto',
}) {
  const startTime = Date.now();

  try {
    let sourceText = '';
    if (filePath) {
      sourceText = await extractTextFromFile(filePath, mimeType);
    } else if (documentId) {
      const doc = await prisma.document.findUnique({ where: { id: documentId } });
      if (!doc) throw new Error('Documento no encontrado');
      sourceText = await extractTextFromFile(doc.filePath, doc.mimeType);
    }

    if (!sourceText?.trim()) {
      throw new Error('No se pudo extraer texto del documento. Verifica que el PDF/DOCX no este vacio o escaneado.');
    }

    const result = await runTranslation(sourceText, targetLanguage, sourceLanguage, provider);

    const outFileName = `${uuidv4()}.txt`;
    const outPath = path.join(config.storageDir, 'translations', outFileName);
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, result.text, 'utf-8');
    const stored = await saveToStorage(outPath, 'translations');

    const wordCount = sourceText.split(/\s+/).filter(Boolean).length;
    const processingTime = Date.now() - startTime;

    const safeSource = sanitizeForDb(sourceText).slice(0, 50000);
    const safeTranslated = sanitizeForDb(result.text).slice(0, 50000);

    await prisma.translation.update({
      where: { id: translationId },
      data: {
        sourceText: safeSource,
        translatedText: safeTranslated,
        translatedFile: stored.localPath,
        provider: result.provider,
        status: 'COMPLETED',
        wordCount,
        processingTime,
      },
    });

    await prisma.subscription.updateMany({
      where: { userId },
      data: { translationsUsed: { increment: 1 } },
    });
  } catch (error) {
    await prisma.translation.update({
      where: { id: translationId },
      data: { status: 'FAILED', errorMessage: error.message?.slice(0, 500) || 'Error desconocido' },
    });
    throw error;
  }
}

/** @deprecated Use startTranslation for async processing */
export async function processTranslation(params) {
  const translation = await startTranslation(params);
  for (let i = 0; i < 120; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const current = await prisma.translation.findUnique({ where: { id: translation.id } });
    if (current?.status === 'COMPLETED' || current?.status === 'FAILED') return current;
  }
  throw new Error('Timeout esperando traduccion');
}

export async function checkTranslationLimit(userId) {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) return { allowed: true };
  if (sub.translationsLimit === -1 || sub.plan === 'ENTERPRISE') return { allowed: true };
  if (sub.translationsUsed >= sub.translationsLimit) {
    return { allowed: false, message: 'Has alcanzado el limite de traducciones de tu plan' };
  }
  return { allowed: true, remaining: sub.translationsLimit - sub.translationsUsed };
}

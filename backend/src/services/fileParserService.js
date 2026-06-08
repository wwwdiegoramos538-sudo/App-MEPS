import fs from 'fs/promises';
import path from 'path';
import mammoth from 'mammoth';

async function parsePdf(buffer) {
  try {
    const pdfModule = await import('pdf-parse/lib/pdf-parse.js').catch(() => import('pdf-parse'));
    const pdf = pdfModule.default || pdfModule;
    const data = await pdf(buffer);
    if (!data.text?.trim()) {
      throw new Error('El PDF no contiene texto extraible. Usa un PDF con texto seleccionable o prueba DOCX/TXT.');
    }
    return data.text;
  } catch (err) {
    if (err.message?.includes('texto extraible')) throw err;
    throw new Error(`No se pudo leer el PDF: ${err.message || 'archivo invalido'}`);
  }
}

export async function extractTextFromFile(filePath, mimeType) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.txt' || mimeType === 'text/plain') {
    return await fs.readFile(filePath, 'utf-8');
  }

  if (ext === '.pdf' || mimeType === 'application/pdf') {
    const buffer = await fs.readFile(filePath);
    return await parsePdf(buffer);
  }

  if (
    ext === '.docx' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  throw new Error('Formato de archivo no soportado');
}

export function getDocumentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.pdf') return 'PDF';
  if (ext === '.docx') return 'DOCX';
  if (ext === '.txt') return 'TXT';
  return 'OTHER';
}

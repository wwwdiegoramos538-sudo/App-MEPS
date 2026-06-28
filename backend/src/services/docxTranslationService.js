import fs from 'fs/promises';
import path from 'path';
import JSZip from 'jszip';

const PARAGRAPH_REGEX = /<w:p\b[^>]*>[\s\S]*?<\/w:p>/g;
const TEXT_NODE_REGEX = /<w:t(?:\s+xml:space="preserve")?\s*>([\s\S]*?)<\/w:t>/g;
const BATCH_SIZE = 4;
const BATCH_DELAY_MS = 450;

const TRANSLATABLE_PARTS = /^word\/(document\.xml|header\d+\.xml|footer\d+\.xml|footnotes\.xml|endnotes\.xml)$/;

function escapeXmlText(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function decodeXmlText(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function getParagraphTextNodes(pXml) {
  const nodes = [];
  let match;
  const regex = new RegExp(TEXT_NODE_REGEX.source, 'g');
  while ((match = regex.exec(pXml)) !== null) {
    nodes.push({
      full: match[0],
      content: decodeXmlText(match[1]),
      index: match.index,
      preserve: match[0].includes('xml:space="preserve"'),
    });
  }
  return nodes;
}

function getCombinedParagraphText(pXml) {
  return getParagraphTextNodes(pXml)
    .map((n) => n.content)
    .join('');
}

function setParagraphTranslation(pXml, translatedText) {
  const nodes = getParagraphTextNodes(pXml);
  if (nodes.length === 0) return pXml;

  let result = pXml;
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];
    const isFirst = i === 0;
    const content = isFirst ? escapeXmlText(translatedText) : '';
    const needsPreserve =
      node.preserve ||
      (isFirst && (translatedText.startsWith(' ') || translatedText.endsWith(' ')));
    const replacement = needsPreserve
      ? `<w:t xml:space="preserve">${content}</w:t>`
      : `<w:t>${content}</w:t>`;

    result = result.slice(0, node.index) + replacement + result.slice(node.index + node.full.length);
  }

  return result;
}

function collectTranslatableParts(zip) {
  return Object.keys(zip.files).filter((name) => TRANSLATABLE_PARTS.test(name));
}

async function processXmlParagraphs(xml, translateBlock) {
  const blocks = [];
  let match;
  const regex = new RegExp(PARAGRAPH_REGEX.source, 'g');
  while ((match = regex.exec(xml)) !== null) {
    const pXml = match[0];
    const text = getCombinedParagraphText(pXml);
    if (!text.trim()) continue;
    blocks.push({
      index: match.index,
      length: pXml.length,
      pXml,
      text,
    });
  }

  const plainParts = [];

  for (let i = 0; i < blocks.length; i += BATCH_SIZE) {
    const batch = blocks.slice(i, i + BATCH_SIZE);
    const translated = await Promise.all(batch.map((b) => translateBlock(b.text)));
    for (let j = 0; j < batch.length; j++) {
      batch[j].newXml = setParagraphTranslation(batch[j].pXml, translated[j]);
      plainParts.push(translated[j]);
    }
    if (i + BATCH_SIZE < blocks.length) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
    }
  }

  let result = xml;
  const updates = blocks
    .filter((b) => b.newXml)
    .sort((a, b) => b.index - a.index);

  for (const block of updates) {
    result =
      result.slice(0, block.index) + block.newXml + result.slice(block.index + block.length);
  }

  return { xml: result, plainParts };
}

/**
 * Traduce un DOCX bloque a bloque (parrafo a parrafo) conservando estilos, colores y layout.
 */
export async function translateDocxPreservingFormat(inputPath, outputPath, translateBlock) {
  const buffer = await fs.readFile(inputPath);
  const zip = await JSZip.loadAsync(buffer);
  const parts = collectTranslatableParts(zip);

  if (parts.length === 0) {
    throw new Error('El DOCX no contiene partes traducibles');
  }

  const allPlainParts = [];

  for (const partPath of parts) {
    const file = zip.file(partPath);
    if (!file) continue;

    const xml = await file.async('string');
    const { xml: updatedXml, plainParts } = await processXmlParagraphs(xml, translateBlock);
    zip.file(partPath, updatedXml);
    allPlainParts.push(...plainParts);
  }

  const outBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, outBuffer);

  return {
    plainText: allPlainParts.join('\n'),
    paragraphCount: allPlainParts.length,
  };
}

export function isDocxFile(filePath, mimeType) {
  const ext = path.extname(filePath || '').toLowerCase() === '.docx';
  const mime =
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  return ext || mime;
}
import { translateDocxPreservingFormat } from '../src/services/docxTranslationService.js';
import { translateWithFallback } from '../src/services/fallbackTranslationService.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const input = path.join(__dirname, '../test-fixtures/sample-formatted.docx');
const output = path.join(__dirname, '../test-fixtures/sample-formatted-es.docx');

const result = await translateDocxPreservingFormat(
  input,
  output,
  (text) => translateWithFallback(text, 'es', 'en')
);

console.log('Paragraphs:', result.paragraphCount);
console.log('Output:', output);
console.log('Preview:', result.plainText.slice(0, 120));

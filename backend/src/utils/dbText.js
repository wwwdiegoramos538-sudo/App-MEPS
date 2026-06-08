/**
 * Sanitiza texto para guardarlo en PostgreSQL.
 * Elimina emojis y caracteres fuera del plano BMP que fallan en clusters WIN1252.
 */
export function sanitizeForDb(text) {
  if (!text) return text;
  return text
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/[\u{10000}-\u{10FFFF}]/gu, '')
    .replace(/[\uD800-\uDFFF]/g, '')
    .replace(/\uFEFF/g, '');
}

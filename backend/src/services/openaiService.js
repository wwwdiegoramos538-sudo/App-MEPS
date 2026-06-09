import OpenAI from 'openai';
import fs from 'fs';
import { config } from '../config/index.js';

let openai = null;

function getOpenAI() {
  if (!config.openaiApiKey) return null;
  if (!openai) {
    openai = new OpenAI({ apiKey: config.openaiApiKey });
  }
  return openai;
}

export async function translateWithOpenAI(text, targetLang, sourceLang = 'auto') {
  const client = getOpenAI();
  if (!client) {
    throw new Error('OpenAI API no configurada');
  }

  const chunkSize = 12000;
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }

  const translated = [];
  for (const chunk of chunks) {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Eres un traductor profesional experto. Traduce el texto de ${sourceLang} a ${targetLang}. Mantén el formato, tono y estructura. Solo devuelve la traduccion sin explicaciones.`,
        },
        { role: 'user', content: chunk },
      ],
      temperature: 0.3,
    });
    translated.push(response.choices[0]?.message?.content || '');
  }

  return translated.join('\n');
}

export function isOpenAIAvailable() {
  return !!getOpenAI();
}

export async function generateAudiobookAudio(text, voice = 'alloy', outputPath) {
  const client = getOpenAI();
  if (!client) {
    throw new Error('OpenAI API no configurada para TTS');
  }

  const maxChunk = 4000;
  const chunks = [];
  for (let i = 0; i < text.length; i += maxChunk) {
    chunks.push(text.slice(i, i + maxChunk));
  }

  const buffers = [];
  for (const chunk of chunks) {
    const mp3 = await client.audio.speech.create({
      model: 'tts-1',
      voice,
      input: chunk,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    buffers.push(buffer);
  }

  const combined = Buffer.concat(buffers);
  fs.writeFileSync(outputPath, combined);
  return outputPath;
}

export async function chatSupport(message, history = []) {
  const client = getOpenAI();
  if (!client) {
    const q = message.toLowerCase();
    if (q.includes('traduc') || q.includes('pdf') || q.includes('docx')) {
      return 'Para traducir: ve a Dashboard → Traducir, sube un PDF/DOCX/TXT y elige idioma destino. MEPS usa DeepL, OpenAI o traductores gratuitos automaticamente.';
    }
    if (q.includes('plan') || q.includes('suscri') || q.includes('pago')) {
      return 'Tu plan actual aparece en Dashboard → Suscripcion. Los pagos con Stripe requieren configurar las claves STRIPE_* en el servidor.';
    }
    if (q.includes('audio') || q.includes('libro')) {
      return 'Para audiolibros: traduce un texto y usa "Crear audiolibro", o ve a Dashboard → Audiolibros. Requiere OPENAI_API_KEY en produccion.';
    }
    return 'Hola, soy el asistente MEPS. Puedo ayudarte con traducciones, documentos, biblioteca y planes. Escribe tu pregunta con mas detalle.';
  }

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'Eres el asistente de soporte de MEPS, plataforma de traduccion con IA. Responde en espanol de forma profesional y concisa. Ayuda con traducciones, suscripciones, subida de archivos y funciones de la plataforma.',
      },
      ...history,
      { role: 'user', content: message },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return response.choices[0]?.message?.content || 'No pude procesar tu consulta.';
}

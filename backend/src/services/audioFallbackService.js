import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

export function canUseLocalTts() {
  return process.platform === 'win32';
}

function normalizeTtsLang(code = 'es') {
  const map = {
    'pt-BR': 'pt',
    zh: 'zh-CN',
  };
  return map[code] || code.split('-')[0];
}

async function synthesizeGoogleTtsChunk(text, language) {
  const tl = normalizeTtsLang(language);
  const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(text)}`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    throw new Error(`TTS gratuito no disponible (${res.status})`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 100) {
    throw new Error('TTS gratuito devolvio audio vacio');
  }
  return buffer;
}

/** TTS gratis en Linux/Render (Google Translate TTS, sin API key) */
export async function generateAudiobookAudioFree(text, language, outputPath) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  const maxChunk = 180;
  const parts = [];
  for (let i = 0; i < text.length; i += maxChunk) {
    const slice = text.slice(i, i + maxChunk).trim();
    if (slice) parts.push(slice);
  }

  if (parts.length === 0) {
    throw new Error('Texto vacio para audiolibro');
  }

  const buffers = [];
  for (let i = 0; i < parts.length; i++) {
    buffers.push(await synthesizeGoogleTtsChunk(parts[i], language));
    if (i < parts.length - 1) {
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  await fs.writeFile(outputPath, Buffer.concat(buffers));
  return outputPath;
}

function psEscapeSingleQuotes(s) {
  return String(s).replace(/'/g, "''");
}

export async function generateAudiobookAudioWav(text, _voice, outputPath) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  // Genera un WAV con la voz del sistema (Windows).
  // Esto permite que la función de audiolibros funcione aun sin OPENAI_API_KEY.
  const textB64 = Buffer.from(String(text), 'utf8').toString('base64');
  const cmd = `
  $ErrorActionPreference = 'Stop';
  Add-Type -AssemblyName System.Speech;
  $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer;
  $bytes = [System.Convert]::FromBase64String('${textB64}');
  $txt = [System.Text.Encoding]::UTF8.GetString($bytes);
  $synth.Rate = 0;
  $synth.SetOutputToWaveFile('${psEscapeSingleQuotes(outputPath)}');
  $synth.Speak($txt) | Out-Null;
  $synth.Dispose();
  `.trim();

  return new Promise((resolve, reject) => {
    const p = spawn(
      'powershell',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', cmd],
      { windowsHide: true }
    );

    let stderr = '';
    p.stderr.on('data', (d) => (stderr += String(d)));
    p.on('exit', (code) => {
      if (code === 0) return resolve(outputPath);
      reject(new Error(`Fallback TTS falló (exit ${code}): ${stderr || 'sin detalle'}`));
    });
  });
}


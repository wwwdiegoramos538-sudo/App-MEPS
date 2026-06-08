import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

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


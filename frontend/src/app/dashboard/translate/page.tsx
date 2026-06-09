'use client';

import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OutlineIcon } from '@/components/icons/OutlineIcon';
import { audiobookApi, translationApi } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/errors';

interface Language {
  code: string;
  name: string;
}

interface TranslationResult {
  id: string;
  status: string;
  provider?: string;
  wordCount?: number;
  processingTime?: number;
  errorMessage?: string;
  translatedText?: string;
}

async function waitForTranslation(id: string, maxAttempts = 90): Promise<TranslationResult> {
  for (let i = 0; i < maxAttempts; i++) {
    const { data } = await translationApi.get(id);
    const translation = data.translation as TranslationResult;
    if (translation.status === 'COMPLETED' || translation.status === 'FAILED') {
      return translation;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error('La traduccion tardo demasiado. Revisa el historial.');
}

export default function TranslatePage() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('en');
  const [provider, setProvider] = useState('auto');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [error, setError] = useState('');
  const [audioBusy, setAudioBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    translationApi.getLanguages().then(({ data }) => setLanguages(data.languages)).catch(() => {
      setError('No se pudieron cargar los idiomas');
    });
  }, []);

  const handleTranslate = async () => {
    if (!file) {
      setError('Selecciona un archivo');
      return;
    }
    setError('');
    setLoading(true);
    setProcessing(false);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('sourceLanguage', sourceLang);
    formData.append('targetLanguage', targetLang);
    formData.append('provider', provider);

    try {
      const { data } = await translationApi.create(formData);
      setProcessing(true);
      setLoading(false);

      const final = await waitForTranslation(data.translation.id);
      setResult(final);

      if (final.status === 'FAILED') {
        setError(final.errorMessage || 'La traduccion fallo. Prueba con un TXT o DOCX, o un PDF con texto seleccionable.');
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Error en la traduccion'));
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!result?.id) return;
    try {
      const { data } = await translationApi.download(result.id);
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `traduccion-${result.id}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Error al descargar'));
    }
  };

  const handleCreateAudiobook = async () => {
    if (!result?.translatedText?.trim()) {
      setError('No hay texto traducido para convertir a audio.');
      return;
    }

    setError('');
    setAudioBusy(true);
    try {
      const { data } = await audiobookApi.create({
        title: `Audiolibro ${result.id.slice(0, 8)}`,
        sourceText: result.translatedText,
        language: targetLang,
        voice: 'alloy',
      });

      const ab = data.audiobook;
      if (ab.status !== 'completed') {
        setError('El audiolibro no se genero correctamente.');
        return;
      }
      const { data: audioBlob } = await audiobookApi.download(ab.id);
      const url = window.URL.createObjectURL(new Blob([audioBlob]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `audiolibro-${ab.id}.mp3`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Error al generar audiolibro'));
    } finally {
      setAudioBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">Traducir documento</h1>
        <p className="text-gray-500 mt-1">PDF, DOCX o TXT - Maximo 25MB</p>
      </div>

      <Card>
        <div
          className="border-2 border-dashed border-black rounded-xl p-12 text-center cursor-pointer hover:bg-meps-light/10 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <OutlineIcon name="upload" size={40} className="mx-auto mb-4" />
          {file ? (
            <p className="font-semibold">{file.name}</p>
          ) : (
            <>
              <p className="font-semibold">Arrastra o haz clic para subir</p>
              <p className="text-sm text-gray-500 mt-1">PDF, DOCX, TXT</p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <div>
            <label className="block text-sm font-medium mb-1.5">Idioma origen</label>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border-2 border-black bg-white dark:bg-gray-900"
            >
              <option value="auto">Detectar automaticamente</option>
              {languages.map((l) => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Idioma destino</label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border-2 border-black bg-white dark:bg-gray-900"
            >
              {languages.filter((l) => l.code !== 'auto').map((l) => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1.5">Motor de IA</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border-2 border-black bg-white dark:bg-gray-900"
          >
            <option value="auto">Automatico (DeepL / OpenAI / respaldo)</option>
            <option value="deepl">DeepL</option>
            <option value="openai">OpenAI GPT</option>
          </select>
        </div>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        <Button className="w-full mt-6" onClick={handleTranslate} loading={loading || processing} disabled={!file || loading || processing}>
          {processing ? 'Traduciendo...' : 'Traducir documento'}
        </Button>

        {processing && (
          <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-2 border-meps-cyan">
            <p className="font-semibold text-meps-dark dark:text-meps-cyan">Procesando traduccion...</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Esto puede tardar unos segundos segun el tamano del archivo.
            </p>
          </div>
        )}

        {result?.status === 'COMPLETED' && (
          <div className="mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border-2 border-green-500">
            <p className="font-semibold text-green-700 dark:text-green-400 mb-1">Traduccion completada</p>
            {result.wordCount != null && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {result.wordCount} palabras · {result.provider} · {Math.round((result.processingTime || 0) / 1000)}s
              </p>
            )}
            <Button variant="secondary" onClick={handleDownload}>
              <OutlineIcon name="download" size={16} className="!border-0 !bg-transparent !shadow-none" />
              Descargar archivo traducido
            </Button>

            <Button className="w-full mt-3" onClick={handleCreateAudiobook} loading={audioBusy} disabled={audioBusy}>
              <OutlineIcon name="headphones" size={16} className="!border-0 !bg-transparent !shadow-none" />
              Generar audiolibro
            </Button>
          </div>
        )}

        {result?.status === 'FAILED' && (
          <div className="mt-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border-2 border-red-500">
            <p className="font-semibold text-red-700 dark:text-red-400">La traduccion fallo</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {result.errorMessage || error || 'Revisa el archivo e intenta de nuevo.'}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OutlineIcon } from '@/components/icons/OutlineIcon';
import { audiobookApi } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/errors';
import { formatDate } from '@/lib/utils';

export default function AudiobooksPage() {
  const [audiobooks, setAudiobooks] = useState<Array<{ id: string; title: string; status: string; language: string; createdAt: string }>>([]);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('es');
  const [voice, setVoice] = useState('alloy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const load = () => audiobookApi.list().then(({ data }) => setAudiobooks(data.audiobooks));

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    try {
      await audiobookApi.create({ title: title || 'Audiolibro MEPS', sourceText: text, language, voice });
      setTitle('');
      setText('');
      load();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'No se pudo generar el audiolibro'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id: string, fileTitle: string) => {
    setError('');
    setDownloadingId(id);
    try {
      const { data } = await audiobookApi.download(id);
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileTitle || 'audiolibro'}.mp3`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Error al descargar el audio'));
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-3xl font-bold">Generador de audiolibros IA</h1>
      <p className="text-gray-500">Convierte texto traducido en audiolibros con voz natural</p>

      <Card>
        <Input label="Titulo del audiolibro" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1.5">Texto a convertir</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className="w-full px-4 py-2.5 rounded-lg border-2 border-black bg-white dark:bg-gray-900"
            placeholder="Pega aqui el texto traducido..."
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Idioma</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border-2 border-black">
              <option value="es">Espanol</option>
              <option value="en">Ingles</option>
              <option value="fr">Frances</option>
              <option value="de">Aleman</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Voz IA</label>
            <select value={voice} onChange={(e) => setVoice(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border-2 border-black">
              <option value="alloy">Alloy</option>
              <option value="echo">Echo</option>
              <option value="fable">Fable</option>
              <option value="onyx">Onyx</option>
              <option value="nova">Nova</option>
              <option value="shimmer">Shimmer</option>
            </select>
          </div>
        </div>
        <Button className="mt-4" onClick={handleCreate} loading={loading}>
          <OutlineIcon name="mic" size={16} className="!border-0 !bg-transparent !shadow-none" />
          Generar audiolibro
        </Button>
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </Card>

      <div className="space-y-3">
        {audiobooks.map((ab) => (
          <Card key={ab.id} className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <OutlineIcon name="headphones" />
              <div>
                <p className="font-semibold">{ab.title}</p>
                <p className="text-sm text-gray-500">{ab.language} - {formatDate(ab.createdAt)} - {ab.status}</p>
              </div>
            </div>
            {ab.status === 'completed' && (
              <Button
                variant="outline"
                size="sm"
                loading={downloadingId === ab.id}
                onClick={() => handleDownload(ab.id, ab.title)}
              >
                Descargar audio
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

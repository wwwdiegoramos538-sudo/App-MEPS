'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OutlineIcon } from '@/components/icons/OutlineIcon';
import { translationApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Translation {
  id: string;
  sourceLanguage: string;
  targetLanguage: string;
  status: string;
  provider: string;
  wordCount?: number;
  createdAt: string;
  document?: { title: string };
}

export default function HistoryPage() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    translationApi.list().then(({ data }) => setTranslations(data.translations)).finally(() => setLoading(false));
  }, []);

  const statusClass: Record<string, string> = {
    COMPLETED: 'badge-success',
    PROCESSING: 'badge-pending',
    FAILED: 'badge-error',
    PENDING: 'badge-pending',
  };

  const handleDownload = async (id: string) => {
    const { data } = await translationApi.download(id);
    const url = window.URL.createObjectURL(new Blob([data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `traduccion-${id}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-2xl sm:text-3xl font-bold">Historial de traducciones</h1>

      {loading ? (
        <div className="text-center py-12">Cargando...</div>
      ) : translations.length === 0 ? (
        <Card className="text-center py-12">
          <OutlineIcon name="history" size={48} className="mx-auto mb-4" />
          <p className="text-gray-500">Sin traducciones aun</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {translations.map((t) => (
            <Card key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <OutlineIcon name="languages" className="shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm sm:text-base truncate">
                    {t.sourceLanguage} → {t.targetLanguage}
                    {t.document && <span className="text-gray-500 font-normal"> - {t.document.title}</span>}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {formatDate(t.createdAt)} - {t.provider}
                    {t.wordCount && ` - ${t.wordCount} palabras`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <span className={statusClass[t.status] || 'badge-pending'}>{t.status}</span>
                {t.status === 'COMPLETED' && (
                  <Button variant="outline" size="sm" onClick={() => handleDownload(t.id)}>
                    <OutlineIcon name="download" size={14} className="!border-0 !bg-transparent !shadow-none" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

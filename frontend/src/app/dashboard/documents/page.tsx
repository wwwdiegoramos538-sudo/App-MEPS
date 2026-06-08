'use client';

import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OutlineIcon } from '@/components/icons/OutlineIcon';
import { documentApi } from '@/lib/api';
import { formatDate, formatFileSize } from '@/lib/utils';

interface Document {
  id: string;
  title: string;
  originalName: string;
  fileSize: number;
  type: string;
  createdAt: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    documentApi.list().then(({ data }) => setDocuments(data.documents)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await documentApi.upload(formData);
      load();
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este documento?')) return;
    await documentApi.delete(id);
    load();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Documentos</h1>
          <p className="text-gray-500">Gestiona tus archivos subidos</p>
        </div>
        <Button onClick={() => fileRef.current?.click()} loading={uploading}>
          <OutlineIcon name="upload" size={16} className="!border-0 !bg-transparent !shadow-none" />
          Subir documento
        </Button>
        <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleUpload} />
      </div>

      {loading ? (
        <div className="text-center py-12">Cargando...</div>
      ) : documents.length === 0 ? (
        <Card className="text-center py-12">
          <OutlineIcon name="file" size={48} className="mx-auto mb-4" />
          <p className="text-gray-500">No hay documentos. Sube tu primer archivo.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <OutlineIcon name="file" />
                <div>
                  <p className="font-semibold">{doc.title}</p>
                  <p className="text-sm text-gray-500">
                    {doc.type} - {formatFileSize(doc.fileSize)} - {formatDate(doc.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={`/dashboard/translate`}>
                  <Button variant="outline" size="sm">Traducir</Button>
                </a>
                <Button variant="danger" size="sm" onClick={() => handleDelete(doc.id)}>
                  <OutlineIcon name="trash" size={14} className="!border-0 !bg-transparent !shadow-none" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

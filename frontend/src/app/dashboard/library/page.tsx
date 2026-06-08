'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { OutlineIcon } from '@/components/icons/OutlineIcon';
import { libraryApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface LibraryItem {
  id: string;
  title: string;
  category: string;
  isFavorite: boolean;
  createdAt: string;
}

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);

  useEffect(() => {
    libraryApi.list().then(({ data }) => setItems(data.items));
  }, []);

  const toggleFavorite = async (id: string) => {
    await libraryApi.toggleFavorite(id);
    const { data } = await libraryApi.list();
    setItems(data.items);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-3xl font-bold">Biblioteca personal</h1>
      <p className="text-gray-500">Organiza tus documentos y traducciones favoritas</p>

      {items.length === 0 ? (
        <Card className="text-center py-12">
          <OutlineIcon name="library" size={48} className="mx-auto mb-4" />
          <p className="text-gray-500">Tu biblioteca esta vacia. Agrega documentos desde la seccion de documentos.</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} hover>
              <div className="flex justify-between items-start mb-3">
                <OutlineIcon name="book" />
                <button onClick={() => toggleFavorite(item.id)}>
                  <OutlineIcon name="star" className={item.isFavorite ? '!bg-yellow-200' : ''} />
                </button>
              </div>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{item.category} - {formatDate(item.createdAt)}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

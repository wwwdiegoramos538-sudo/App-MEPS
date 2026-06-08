'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OutlineIcon } from '@/components/icons/OutlineIcon';
import { designApi } from '@/lib/api';

export default function DesignsPage() {
  const [designs, setDesigns] = useState<Array<{ id: string; title: string; template?: string }>>([]);
  const [templates, setTemplates] = useState<Array<{ id: string; name: string }>>([]);
  const [title, setTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('modern-1');
  const [bgColor, setBgColor] = useState('#001FAD');
  const [coverTitle, setCoverTitle] = useState('Mi Libro');
  const [fontFamily, setFontFamily] = useState('Inter');

  useEffect(() => {
    designApi.getTemplates().then(({ data }) => setTemplates(data.templates));
    designApi.list().then(({ data }) => setDesigns(data.designs));
  }, []);

  const handleCreate = async () => {
    await designApi.create({
      title: title || coverTitle,
      template: selectedTemplate,
      content: {
        background: bgColor,
        title: coverTitle,
        fontFamily,
        titleColor: '#FFFFFF',
        elements: [],
      },
    });
    const { data } = await designApi.list();
    setDesigns(data.designs);
    setTitle('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-3xl font-bold">Editor de portadas</h1>
      <p className="text-gray-500">Disena portadas profesionales tipo Canva</p>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-bold mb-4">Configuracion</h2>
          <div className="space-y-4">
            <Input label="Titulo del diseno" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input label="Texto de portada" value={coverTitle} onChange={(e) => setCoverTitle(e.target.value)} />
            <div>
              <label className="block text-sm font-medium mb-1.5">Plantilla</label>
              <select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border-2 border-black">
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Color de fondo</label>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-10 rounded border-2 border-black cursor-pointer" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Tipografia</label>
              <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border-2 border-black">
                <option value="Inter">Inter</option>
                <option value="Georgia">Georgia</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="Roboto Mono">Roboto Mono</option>
              </select>
            </div>
            <Button onClick={handleCreate}>
              <OutlineIcon name="plus" size={16} className="!border-0 !bg-transparent !shadow-none" />
              Guardar diseno
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="font-bold mb-4">Vista previa</h2>
          <div
            className="aspect-[3/4] rounded-xl border-4 border-black flex flex-col items-center justify-center p-8 shadow-[6px_6px_0_#000]"
            style={{ backgroundColor: bgColor, fontFamily }}
          >
            <OutlineIcon name="book" size={48} className="mb-6" />
            <h3 className="text-3xl font-bold text-white text-center">{coverTitle}</h3>
            <p className="text-white/70 mt-2 italic text-sm">MEPS - Traduciendo el Futuro</p>
          </div>
        </Card>
      </div>

      {designs.length > 0 && (
        <div>
          <h2 className="font-bold text-lg mb-4">Mis disenos</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {designs.map((d) => (
              <Card key={d.id} hover>
                <OutlineIcon name="palette" className="mb-2" />
                <p className="font-semibold">{d.title}</p>
                <p className="text-sm text-gray-500">{d.template}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

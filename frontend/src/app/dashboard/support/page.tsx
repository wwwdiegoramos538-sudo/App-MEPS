'use client';

import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OutlineIcon } from '@/components/icons/OutlineIcon';
import { chatApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Message {
  id: string;
  message: string;
  isSupport: boolean;
  createdAt: string;
}

export default function SupportPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatApi.getMessages().then(({ data }) => setMessages(data.messages));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    const userMsg = input;
    setInput('');
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), message: userMsg, isSupport: false, createdAt: new Date().toISOString() },
    ]);
    try {
      const { data } = await chatApi.send(userMsg);
      setMessages((prev) => [...prev, data.reply]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in h-[calc(100vh-12rem)] flex flex-col">
      <div>
        <h1 className="font-display text-3xl font-bold">Soporte</h1>
        <p className="text-gray-500">Chat con asistente IA de MEPS</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden !p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <OutlineIcon name="message" size={40} className="mx-auto mb-3" />
              <p>Hola! Soy el asistente de MEPS. En que puedo ayudarte?</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isSupport ? 'justify-start' : 'justify-end'}`}>
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-xl border-2 border-black text-sm ${
                  msg.isSupport
                    ? 'bg-white dark:bg-gray-800'
                    : 'bg-meps-dark text-white'
                }`}
              >
                <p>{msg.message}</p>
                <p className="text-xs opacity-60 mt-1">{formatDate(msg.createdAt)}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 border-t-2 border-black flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 px-4 py-2.5 rounded-lg border-2 border-black bg-white dark:bg-gray-900"
          />
          <Button type="submit" loading={loading}>Enviar</Button>
        </form>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { OutlineIcon } from '@/components/icons/OutlineIcon';

const steps = [
  { title: 'Bienvenido a MEPS', subtitle: 'Traduciendo el Futuro', desc: 'La plataforma de traduccion con IA mas avanzada' },
  { title: 'Traduce cualquier documento', subtitle: 'PDF, DOCX, TXT', desc: 'Sube tus archivos y obten traducciones profesionales' },
  { title: 'Crea audiolibros con IA', subtitle: 'Texto a voz natural', desc: 'Convierte tus traducciones en audiolibros' },
  { title: 'Listo para comenzar', subtitle: 'Tu futuro multilingual', desc: 'Comienza a traducir en segundos' },
];

export default function WelcomePage() {
  const [step, setStep] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s < steps.length - 1 ? s + 1 : s));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-meps-dark via-[#0a1628] to-black flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern bg-[length:50px_50px] opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-meps-cyan/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-meps-primary/20 rounded-full blur-3xl" />

      <div className="relative z-10 text-center px-4 max-w-2xl">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="mb-8"
        >
          <Image
            src="/logo.png"
            alt="MEPS"
            width={200}
            height={200}
            className="mx-auto rounded-2xl border-4 border-black shadow-[8px_8px_0_#00D4FF] animate-float"
          />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-2">
              {steps[step].title}
            </h1>
            <p className="text-meps-cyan text-xl font-semibold mb-4">{steps[step].subtitle}</p>
            <p className="text-gray-400 mb-8">{steps[step].desc}</p>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-2 rounded-full border border-black transition-all ${
                i === step ? 'w-8 bg-meps-cyan' : 'w-2 bg-gray-600'
              }`}
              aria-label={`Paso ${i + 1}`}
            />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => router.push('/register')}>
            Crear cuenta gratis
            <OutlineIcon name="arrow" size={16} className="!border-0 !bg-transparent !shadow-none" />
          </Button>
          <Button variant="outline" size="lg" className="!text-white !border-white" onClick={() => router.push('/')}>
            Ver landing
          </Button>
        </div>

        <button onClick={() => router.push('/login')} className="mt-6 text-sm text-gray-400 hover:text-meps-cyan transition-colors">
          Ya tengo cuenta - Iniciar sesion
        </button>
      </div>
    </div>
  );
}

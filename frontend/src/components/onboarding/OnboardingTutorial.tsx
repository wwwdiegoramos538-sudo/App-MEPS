'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { OutlineIcon } from '@/components/icons/OutlineIcon';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import {
  TUTORIAL_STEPS,
  isTutorialDone,
  markTutorialDone,
} from '@/lib/onboarding';

interface OnboardingTutorialProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export function OnboardingTutorial({ forceOpen = false, onClose }: OnboardingTutorialProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    if (forceOpen) {
      setStep(0);
      setOpen(true);
      return;
    }
    if (!isTutorialDone(user.id)) {
      const timer = setTimeout(() => {
        setStep(0);
        setOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [user?.id, forceOpen]);

  const close = () => {
    if (user?.id) markTutorialDone(user.id);
    setOpen(false);
    onClose?.();
  };

  const skip = () => close();

  const next = () => {
    if (step >= TUTORIAL_STEPS.length - 1) {
      close();
      return;
    }
    setStep((s) => s + 1);
  };

  const prev = () => setStep((s) => Math.max(0, s - 1));

  if (!open) return null;

  const current = TUTORIAL_STEPS[step];
  const progress = ((step + 1) / TUTORIAL_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={skip}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
        className="relative w-full max-w-lg bg-white dark:bg-gray-950 border-2 border-black rounded-2xl shadow-brutal-lg overflow-hidden"
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800">
          <motion.div
            className="h-full bg-gradient-to-r from-meps-primary to-meps-cyan"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl border-2 border-black bg-meps-sky/40 dark:bg-meps-dark/40">
                <OutlineIcon name={current.icon as 'sparkles'} size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-meps-primary dark:text-meps-cyan uppercase tracking-wide">
                  Paso {step + 1} de {TUTORIAL_STEPS.length}
                </p>
                <p className="text-sm text-gray-500">{current.subtitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={skip}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
              aria-label="Cerrar tutorial"
            >
              <OutlineIcon name="close" size={18} className="!border-0 !shadow-none !bg-transparent" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
            >
              <h2 id="tutorial-title" className="font-display text-2xl font-bold mb-3">
                {current.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-5 leading-relaxed">
                {current.description}
              </p>
              <ul className="space-y-2.5 mb-6">
                {current.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                    <OutlineIcon name="check" size={16} className="shrink-0 mt-0.5 !border-0 !shadow-none" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              {current.route && current.routeLabel && (
                <Link
                  href={current.route}
                  onClick={close}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-meps-primary dark:text-meps-cyan hover:underline mb-2"
                >
                  {current.routeLabel}
                  <OutlineIcon name="arrow" size={14} className="!border-0 !shadow-none !bg-transparent" />
                </Link>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {TUTORIAL_STEPS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setStep(i)}
                className={`h-2 rounded-full border border-black transition-all ${
                  i === step ? 'w-6 bg-meps-cyan' : 'w-2 bg-gray-300 dark:bg-gray-600'
                }`}
                aria-label={`Ir al paso ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
            <Button variant="outline" onClick={skip} className="sm:min-w-[120px]">
              Saltar tutorial
            </Button>
            <div className="flex gap-2">
              {step > 0 && (
                <Button variant="secondary" onClick={prev}>
                  Anterior
                </Button>
              )}
              <Button onClick={next} className="flex-1 sm:flex-none sm:min-w-[140px]">
                {step >= TUTORIAL_STEPS.length - 1 ? 'Comenzar' : 'Siguiente'}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

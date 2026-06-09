'use client';

import { useCallback, useLayoutEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const PARTICLES = [
  { x: '8%', y: '15%', size: 6, delay: 0 },
  { x: '92%', y: '22%', size: 4, delay: 0.1 },
  { x: '15%', y: '78%', size: 5, delay: 0.2 },
  { x: '85%', y: '70%', size: 7, delay: 0.15 },
  { x: '50%', y: '8%', size: 3, delay: 0.25 },
  { x: '72%', y: '45%', size: 4, delay: 0.3 },
  { x: '28%', y: '55%', size: 5, delay: 0.05 },
  { x: '95%', y: '88%', size: 3, delay: 0.35 },
];

const ORBIT_LANGS = ['ES', 'EN', 'FR', 'DE', 'PT', 'JA', 'ZH', 'AR'];
const LETTERS = 'MEPS'.split('');
const INTRO_MS = 4800;

export function AppIntro() {
  const [visible, setVisible] = useState(true);

  const cleanup = useCallback(() => {
    document.documentElement.classList.remove('meps-intro-active');
    document.body.style.overflow = '';
    const staticSplash = document.getElementById('meps-static-splash');
    if (staticSplash) staticSplash.style.display = 'none';
  }, []);

  const finish = useCallback(() => {
    setVisible(false);
  }, []);

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      cleanup();
      setVisible(false);
      return;
    }

    document.documentElement.classList.add('meps-intro-active');
    document.body.style.overflow = 'hidden';
    setVisible(true);

    const minTimer = setTimeout(() => setVisible(false), INTRO_MS);

    return () => {
      clearTimeout(minTimer);
      cleanup();
    };
  }, [cleanup]);

  return (
    <AnimatePresence onExitComplete={cleanup}>
      {visible && (
        <motion.div
          key="meps-intro"
          id="meps-intro-overlay"
          className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.06, filter: 'blur(10px)' }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="absolute inset-0 bg-[#030818]" />
          <div className="absolute inset-0 intro-bg-gradient" />
          <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.12]" />

          <motion.div
            className="absolute w-[140vmax] h-[140vmax] rounded-full border border-meps-cyan/20"
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 2.4, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute w-[90vmax] h-[90vmax] rounded-full border-2 border-meps-primary/30"
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 2, delay: 0.15, ease: 'easeOut' }}
          />

          {PARTICLES.map((p, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full bg-meps-cyan intro-particle"
              style={{ left: p.x, top: p.y, width: p.size, height: p.size }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0.6, 1], scale: [0, 1.2, 1] }}
              transition={{ duration: 1.2, delay: p.delay, ease: 'easeOut' }}
            />
          ))}

          <div className="relative z-10 flex flex-col items-center px-6">
            <div className="relative mb-8">
              {ORBIT_LANGS.map((lang, i) => {
                const angle = (i / ORBIT_LANGS.length) * Math.PI * 2;
                const radius = 88;
                return (
                  <motion.span
                    key={lang}
                    className="absolute left-1/2 top-1/2 text-[10px] sm:text-xs font-bold text-meps-cyan/90 border border-meps-cyan/40 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm"
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      x: Math.cos(angle) * radius,
                      y: Math.sin(angle) * radius,
                      scale: [0, 1, 1, 0.8],
                    }}
                    transition={{ duration: 2.6, delay: 0.4 + i * 0.05, ease: 'easeOut' }}
                    style={{ marginLeft: -12, marginTop: -10 }}
                  >
                    {lang}
                  </motion.span>
                );
              })}

              <motion.div
                className="absolute inset-0 -m-6 rounded-full intro-logo-glow"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0, 0.9, 0.5], scale: [0.5, 1.15, 1] }}
                transition={{ duration: 1.6, ease: 'easeOut' }}
              />

              <motion.div
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.15 }}
              >
                <Image
                  src="/logo.png"
                  alt="MEPS"
                  width={160}
                  height={160}
                  priority
                  className="relative w-28 h-28 sm:w-40 sm:h-40 rounded-2xl border-4 border-black shadow-[6px_6px_0_#00D4FF] intro-logo-shine"
                />
              </motion.div>
            </div>

            <div className="flex gap-1 sm:gap-2 mb-3">
              {LETTERS.map((letter, i) => (
                <motion.span
                  key={i}
                  className="font-display text-5xl sm:text-7xl font-bold text-white intro-letter-shine"
                  initial={{ opacity: 0, y: 40, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                    delay: 0.45 + i * 0.08,
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            <motion.p
              className="text-meps-cyan text-sm sm:text-lg font-semibold tracking-[0.25em] uppercase mb-1"
              initial={{ opacity: 0, letterSpacing: '0.5em' }}
              animate={{ opacity: 1, letterSpacing: '0.25em' }}
              transition={{ duration: 0.8, delay: 0.95 }}
            >
              Traduciendo el Futuro
            </motion.p>

            <motion.p
              className="text-white/50 text-xs sm:text-sm mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, delay: 1.2, repeat: Infinity }}
            >
              Cargando plataforma...
            </motion.p>

            <motion.div
              className="h-1.5 w-48 sm:w-64 rounded-full bg-white/10 overflow-hidden"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 1.1, duration: 0.4 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-meps-primary via-meps-cyan to-meps-accent rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.8, delay: 1.2, ease: 'easeInOut' }}
              />
            </motion.div>
          </div>

          <motion.button
            type="button"
            onClick={finish}
            className="absolute bottom-8 right-6 sm:bottom-10 sm:right-10 text-xs sm:text-sm text-white/50 hover:text-meps-cyan transition-colors z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            Saltar intro
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

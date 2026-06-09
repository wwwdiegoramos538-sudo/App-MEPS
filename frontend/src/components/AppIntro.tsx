'use client';

import { useCallback, useLayoutEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const PARTICLES = [
  { x: '8%', y: '15%', size: 4, delay: 0 },
  { x: '92%', y: '22%', size: 3, delay: 0.15 },
  { x: '15%', y: '78%', size: 3, delay: 0.3 },
  { x: '85%', y: '70%', size: 4, delay: 0.2 },
  { x: '50%', y: '8%', size: 2, delay: 0.4 },
  { x: '72%', y: '45%', size: 3, delay: 0.5 },
  { x: '28%', y: '55%', size: 3, delay: 0.1 },
  { x: '95%', y: '88%', size: 2, delay: 0.55 },
];

const ORBIT_LANGS = ['ES', 'EN', 'FR', 'DE', 'PT', 'JA', 'ZH', 'AR'];
const LETTERS = 'MEPS'.split('');
const INTRO_MS = 6200;
const ORBIT_RADIUS = '5.75rem';

const softEase = [0.25, 0.1, 0.25, 1] as const;

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
          exit={{ opacity: 0, scale: 1.02, filter: 'blur(6px)' }}
          transition={{ duration: 1, ease: softEase }}
        >
          <div className="absolute inset-0 bg-[#030818]" />
          <div className="absolute inset-0 intro-bg-gradient" />
          <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.08]" />

          <motion.div
            className="absolute w-[140vmax] h-[140vmax] rounded-full border border-meps-cyan/10"
            initial={{ scale: 0.6, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 3.5, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute w-[90vmax] h-[90vmax] rounded-full border border-meps-primary/15"
            initial={{ scale: 0.7, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 3, delay: 0.3, ease: 'easeOut' }}
          />

          {PARTICLES.map((p, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full bg-meps-cyan/60 intro-particle"
              style={{ left: p.x, top: p.y, width: p.size, height: p.size }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 0.5, 0.35], scale: [0, 1, 0.9] }}
              transition={{ duration: 2, delay: p.delay, ease: 'easeOut' }}
            />
          ))}

          <div className="relative z-10 flex flex-col items-center px-6">
            <div
              className="relative mb-8 flex items-center justify-center w-[min(78vw,19rem)] h-[min(78vw,19rem)] sm:w-[20rem] sm:h-[20rem]"
              style={{ '--orbit-radius': ORBIT_RADIUS } as React.CSSProperties}
            >
              <motion.div
                className="absolute inset-2"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.4, delay: 0.5, ease: softEase }}
              >
                <div className="intro-orbit-ring absolute inset-0 rounded-full border border-meps-cyan/20" />
              </motion.div>

              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.7, ease: 'easeOut' }}
              >
                <div className="intro-orbit-spin absolute inset-0">
                  {ORBIT_LANGS.map((lang, i) => {
                    const angle = (360 / ORBIT_LANGS.length) * i;
                    return (
                      <div
                        key={lang}
                        className="intro-orbit-item"
                        style={{ '--orbit-angle': `${angle}deg` } as React.CSSProperties}
                      >
                        <div className="intro-orbit-counter">
                          <span className="intro-orbit-label">{lang}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div
                className="absolute inset-0 m-auto w-36 h-36 sm:w-44 sm:h-44 rounded-full intro-logo-glow pointer-events-none"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: [0, 0.6, 0.35], scale: [0.85, 1.05, 1] }}
                transition={{ duration: 2.2, ease: 'easeOut' }}
              />

              <motion.div
                className="relative z-10"
                initial={{ scale: 0.88, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.4, delay: 0.2, ease: softEase }}
              >
                <Image
                  src="/logo.png"
                  alt="MEPS"
                  width={160}
                  height={160}
                  priority
                  className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-4 border-black shadow-[4px_4px_0_rgba(0,212,255,0.6)] intro-logo-shine"
                />
              </motion.div>
            </div>

            <div className="flex gap-1 sm:gap-2 mb-3">
              {LETTERS.map((letter, i) => (
                <motion.span
                  key={i}
                  className="font-display text-5xl sm:text-7xl font-bold text-white intro-letter-shine"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.9,
                    delay: 0.55 + i * 0.1,
                    ease: softEase,
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            <motion.p
              className="text-meps-cyan/90 text-sm sm:text-lg font-medium tracking-[0.2em] uppercase mb-1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.1, ease: softEase }}
            >
              Traduciendo el Futuro
            </motion.p>

            <motion.p
              className="text-white/40 text-xs sm:text-sm mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.35, 0.7, 0.35] }}
              transition={{ duration: 2.2, delay: 1.3, repeat: Infinity, ease: 'easeInOut' }}
            >
              Cargando plataforma...
            </motion.p>

            <motion.div
              className="h-1 w-48 sm:w-64 rounded-full bg-white/10 overflow-hidden"
              initial={{ opacity: 0, scaleX: 0.8 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 1.2, duration: 0.8, ease: softEase }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-meps-primary/80 via-meps-cyan/80 to-meps-accent/80 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 3.8, delay: 1.3, ease: softEase }}
              />
            </motion.div>
          </div>

          <motion.button
            type="button"
            onClick={finish}
            className="absolute bottom-8 right-6 sm:bottom-10 sm:right-10 text-xs sm:text-sm text-white/40 hover:text-meps-cyan/80 transition-colors z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.8, ease: 'easeOut' }}
          >
            Saltar intro
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

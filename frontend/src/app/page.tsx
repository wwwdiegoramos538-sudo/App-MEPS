'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { OutlineIcon } from '@/components/icons/OutlineIcon';

const features = [
  { icon: 'file', title: 'Documentos PDF, DOCX, TXT', desc: 'Sube y traduce cualquier documento profesional al instante.' },
  { icon: 'languages', title: '50+ idiomas', desc: 'Traduccion precisa con DeepL y OpenAI a mas de 50 idiomas.' },
  { icon: 'headphones', title: 'Audiolibros IA', desc: 'Convierte textos traducidos en audiolibros con voz natural.' },
  { icon: 'palette', title: 'Editor de portadas', desc: 'Disena portadas profesionales tipo Canva con plantillas modernas.' },
  { icon: 'library', title: 'Biblioteca personal', desc: 'Organiza todos tus documentos y traducciones en un solo lugar.' },
  { icon: 'zap', title: 'IA avanzada', desc: 'Motor dual DeepL + OpenAI para maxima calidad y velocidad.' },
];

const plans = [
  { name: 'Gratis', price: '$0', features: ['5 traducciones/mes', 'PDF, DOCX, TXT', '50+ idiomas'], cta: 'Comenzar' },
  { name: 'Basico', price: '$9.99', features: ['50 traducciones/mes', 'Biblioteca', 'Soporte email'], cta: 'Elegir plan', popular: false },
  { name: 'Profesional', price: '$29.99', features: ['500 traducciones', 'Audiolibros IA', 'Editor portadas'], cta: 'Elegir plan', popular: true },
  { name: 'Empresarial', price: '$99.99', features: ['Ilimitado', 'API dedicada', 'Soporte 24/7'], cta: 'Contactar', popular: false },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <section className="relative pt-20 sm:pt-24 pb-16 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-hero-light dark:bg-hero-gradient dark:bg-grid-pattern-dark bg-grid-pattern bg-[length:32px_32px] sm:bg-[length:40px_40px] opacity-90" />
        <div className="page-container relative">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 border-black bg-meps-cyan/40 text-sm font-semibold mb-5 shadow-brutal-sm">
                <OutlineIcon name="sparkles" size={16} />
                Plataforma SaaS con Inteligencia Artificial
              </span>
              <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5">
                Traduce el futuro con <span className="text-gradient">MEPS</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-lg">
                Traduce documentos, libros, revistas, manuales y crea audiolibros en mas de 50 idiomas. La plataforma
                profesional de traduccion con IA.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                <Link href="/welcome" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto">
                    Explorar plataforma
                    <OutlineIcon name="arrow" size={16} className="!border-0 !bg-transparent !shadow-none" />
                  </Button>
                </Link>
                <Link href="/register" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Comenzar gratis
                  </Button>
                </Link>
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-6 mt-8 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <OutlineIcon name="check" size={16} /> Sin tarjeta
                </span>
                <span className="flex items-center gap-2">
                  <OutlineIcon name="check" size={16} /> 5 traducciones gratis
                </span>
                <span className="flex items-center gap-2">
                  <OutlineIcon name="check" size={16} /> 50+ idiomas
                </span>
              </div>
              <Link
                href="/acceso-movil"
                className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-meps-primary hover:underline"
              >
                <OutlineIcon name="upload" size={16} />
                Abrir en celular (QR)
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative flex justify-center order-first lg:order-none"
            >
              <div className="animate-float w-full max-w-[280px] sm:max-w-[360px] lg:max-w-[400px]">
                <Image
                  src="/logo.png"
                  alt="MEPS Logo"
                  width={400}
                  height={400}
                  className="w-full h-auto rounded-2xl border-4 border-black shadow-brutal-lg dark:shadow-brutal-cyan"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="features" className="section-muted">
        <div className="page-container">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Todo lo que necesitas</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
              Una plataforma completa para traducir, publicar y distribuir contenido en cualquier idioma.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
              >
                <Card hover variant="elevated" className="h-full">
                  <OutlineIcon name={f.icon as 'file'} size={28} className="mb-4" />
                  <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{f.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section-light">
        <div className="page-container">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-12 sm:mb-16">Como funciona</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: 'upload', title: 'Sube tu archivo', desc: 'PDF, DOCX o TXT hasta 25MB' },
              { step: '02', icon: 'languages', title: 'Elige idiomas', desc: 'Mas de 50 idiomas disponibles' },
              { step: '03', icon: 'download', title: 'Descarga resultado', desc: 'Archivo traducido listo al instante' },
            ].map((s) => (
              <div key={s.step} className="text-center p-4 rounded-2xl bg-meps-sky/20 dark:bg-transparent">
                <div className="text-4xl sm:text-5xl font-display font-bold text-meps-primary/30 dark:text-meps-cyan/30 mb-4">
                  {s.step}
                </div>
                <OutlineIcon name={s.icon as 'upload'} size={32} className="mx-auto mb-4" />
                <h3 className="font-bold text-lg sm:text-xl mb-2">{s.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="section-muted">
        <div className="page-container">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-4">Planes y precios</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-10 sm:mb-12 text-sm sm:text-base">
            Elige el plan perfecto para ti
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                variant={plan.popular ? 'elevated' : 'default'}
                hover
                className={plan.popular ? 'ring-2 ring-meps-cyan sm:scale-[1.02] z-10' : ''}
              >
                {plan.popular && (
                  <span className="text-xs font-bold bg-meps-cyan text-black px-2 py-0.5 rounded border border-black mb-3 inline-block">
                    Popular
                  </span>
                )}
                <h3 className="font-bold text-xl">{plan.name}</h3>
                <p className="text-3xl font-display font-bold my-4">
                  {plan.price}
                  <span className="text-sm font-normal text-gray-500">/mes</span>
                </p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <OutlineIcon name="check" size={14} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button variant={plan.popular ? 'primary' : 'outline'} className="w-full">
                    {plan.cta}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-black py-10 sm:py-12 bg-white dark:bg-gray-950">
        <div className="page-container flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <p className="text-sm text-gray-500">2026 MEPS - Traduciendo el Futuro. Todos los derechos reservados.</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm">
            <Link href="/acceso-movil" className="hover:text-meps-primary font-medium">
              Celular / QR
            </Link>
            <Link href="/login" className="hover:text-meps-primary">
              Iniciar sesion
            </Link>
            <Link href="/register" className="hover:text-meps-primary">
              Registrarse
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

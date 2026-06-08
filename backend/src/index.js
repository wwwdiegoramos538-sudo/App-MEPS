import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { handleWebhook } from './services/stripeService.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import documentRoutes from './routes/documents.js';
import translationRoutes from './routes/translations.js';
import libraryRoutes from './routes/library.js';
import subscriptionRoutes from './routes/subscriptions.js';
import paymentRoutes from './routes/payments.js';
import audiobookRoutes from './routes/audiobooks.js';
import designRoutes from './routes/designs.js';
import chatRoutes from './routes/chat.js';
import adminRoutes from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

[config.uploadsDir, config.storageDir, path.join(config.storageDir, 'translations'), path.join(config.storageDir, 'audiobooks'), path.join(config.storageDir, 'documents')].forEach(
  (dir) => fs.mkdirSync(dir, { recursive: true })
);

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const corsOrigins = [
  config.frontendUrl,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (corsOrigins.includes(origin)) return callback(null, true);
      if (/^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+):(3000|3001)$/.test(origin)) {
        return callback(null, true);
      }
      if (/^https:\/\/[\w-]+\.onrender\.com$/.test(origin)) {
        return callback(null, true);
      }
      if (config.nodeEnv === 'development') return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    await handleWebhook(req.body, sig);
    res.json({ received: true });
  } catch (err) {
    next(err);
  }
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Demasiadas solicitudes, intenta mas tarde' },
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Demasiados intentos de autenticacion' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/storage', express.static(config.storageDir));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MEPS API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api', (req, res) => {
  res.json({
    name: 'MEPS API',
    version: '1.0.0',
    documentation: {
      auth: {
        'POST /api/auth/register': 'Registrar usuario',
        'POST /api/auth/login': 'Iniciar sesion',
        'POST /api/auth/forgot-password': 'Recuperar contrasena',
        'POST /api/auth/reset-password': 'Restablecer contrasena',
      },
      users: { 'GET /api/users/profile': 'Perfil (auth)', 'GET /api/users/stats': 'Estadisticas' },
      documents: { 'POST /api/documents/upload': 'Subir archivo', 'GET /api/documents': 'Listar' },
      translations: {
        'GET /api/translations/languages': 'Idiomas disponibles',
        'POST /api/translations': 'Traducir archivo',
        'GET /api/translations/:id/download': 'Descargar',
      },
      library: { 'GET /api/library': 'Biblioteca personal' },
      subscriptions: { 'GET /api/subscriptions/plans': 'Planes', 'POST /api/subscriptions/checkout': 'Stripe checkout' },
      audiobooks: { 'POST /api/audiobooks': 'Generar audiolibro IA' },
      designs: { 'GET /api/designs/templates': 'Plantillas', 'POST /api/designs': 'Crear diseno' },
      chat: { 'POST /api/chat': 'Soporte IA' },
      admin: { 'GET /api/admin/dashboard': 'Panel admin (ADMIN)' },
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/translations', translationRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/audiobooks', audiobookRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, '0.0.0.0', () => {
  console.log(`MEPS API corriendo en http://localhost:${config.port}`);
  console.log(`Documentacion: http://localhost:${config.port}/api`);
  console.log(`Red local: usa http://<IP-de-tu-PC>:3000 en el celular (API via /api)`);
});

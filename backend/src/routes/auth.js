import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import { prisma } from '../config/database.js';
import { config } from '../config/index.js';
import { generateToken } from '../middleware/auth.js';
import { sendPasswordResetEmail } from '../services/emailService.js';

const router = Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    const message =
      first?.path === 'email'
        ? 'Correo electronico invalido'
        : first?.path === 'password'
          ? 'La contrasena debe tener al menos 8 caracteres'
          : first?.path === 'name'
            ? 'El nombre debe tener al menos 2 caracteres'
            : 'Datos invalidos';
    return res.status(400).json({ error: message, details: errors.array() });
  }
  next();
};

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('name').trim().isLength({ min: 2 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password, name } = req.body;

      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) {
        return res.status(409).json({ error: 'El correo ya esta registrado' });
      }

      const hashed = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashed,
          name,
          subscription: { create: { plan: 'FREE', translationsLimit: 5 } },
        },
        include: { subscription: true },
      });

      const { password: _pwd, resetToken, resetExpires, ...safeUser } = user;
      const token = generateToken(safeUser);
      res.status(201).json({ user: safeUser, token });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
        include: { subscription: true },
      });

      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'Credenciales invalidas' });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: 'Credenciales invalidas' });
      }

      const token = generateToken(user);
      const { password: _, resetToken, resetExpires, ...safeUser } = user;
      res.json({ user: safeUser, token });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  validate,
  async (req, res, next) => {
    try {
      const { email } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res.json({ message: 'Si el correo existe, recibiras instrucciones' });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 3600000);

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetExpires },
      });

      const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;
      const result = await sendPasswordResetEmail(email, resetUrl);

      res.json({
        message: 'Si el correo existe, recibiras instrucciones',
        ...(process.env.NODE_ENV === 'development' && !result.sent && { resetUrl }),
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/reset-password',
  [body('token').notEmpty(), body('password').isLength({ min: 8 })],
  validate,
  async (req, res, next) => {
    try {
      const { token, password } = req.body;

      const user = await prisma.user.findFirst({
        where: { resetToken: token, resetExpires: { gt: new Date() } },
      });

      if (!user) {
        return res.status(400).json({ error: 'Token invalido o expirado' });
      }

      const hashed = await bcrypt.hash(password, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashed, resetToken: null, resetExpires: null },
      });

      res.json({ message: 'Contrasena actualizada correctamente' });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/me', async (req, res) => {
  res.status(401).json({ error: 'Use Authorization header' });
});

export default router;

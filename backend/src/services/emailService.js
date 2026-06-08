import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

let transporter = null;

function getTransporter() {
  if (!config.smtp.host || !config.smtp.user) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    });
  }
  return transporter;
}

export async function sendPasswordResetEmail(email, resetUrl) {
  const transport = getTransporter();
  if (!transport) {
    console.log('[MEPS] Reset URL (SMTP no configurado):', resetUrl);
    return { sent: false, resetUrl };
  }

  await transport.sendMail({
    from: config.smtp.from,
    to: email,
    subject: 'MEPS - Recuperacion de contrasena',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#001FAD;">MEPS - Traduciendo el Futuro</h2>
        <p>Recibimos una solicitud para restablecer tu contrasena.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#001FAD;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;">Restablecer contrasena</a>
        <p style="color:#666;margin-top:24px;">Este enlace expira en 1 hora. Si no solicitaste esto, ignora este correo.</p>
      </div>
    `,
  });
  return { sent: true };
}

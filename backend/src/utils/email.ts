import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !port || !user || !pass) return null;
  const portNum = parseInt(port, 10);
  // Ports 2525 and 587 use STARTTLS (plain first); only 465 uses direct TLS. Avoid SSL "wrong version number" on Mailtrap etc.
  const useSecure = process.env.SMTP_SECURE === 'true' && portNum === 465;
  transporter = nodemailer.createTransport({
    host,
    port: portNum,
    secure: useSecure,
    auth: { user, pass },
  });
  return transporter;
}

/** Returns true if sending password reset email is enabled and SMTP is configured. */
export function isPasswordResetEmailEnabled(): boolean {
  if (process.env.SEND_PASSWORD_RESET_EMAIL !== 'true') return false;
  return getTransporter() !== null;
}

/**
 * Send password reset email with link. Reset link base URL comes from FRONTEND_URL
 * in .env (e.g. https://yourdomain.com for Hostinger). Does not throw; logs errors.
 */
export async function sendPasswordResetEmail(
  to: string,
  resetLink: string,
  expiresAt: Date
): Promise<void> {
  const trans = getTransporter();
  if (!trans) return;
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
  const expiresIn = Math.round((expiresAt.getTime() - Date.now()) / 60000);
  try {
    await trans.sendMail({
      from,
      to,
      subject: 'Reset your password - ChibiBadminton',
      text: `You requested a password reset. Click the link below to set a new password. This link expires in ${expiresIn} minutes.\n\n${resetLink}\n\nIf you did not request this, you can ignore this email.`,
      html: `
        <p>You requested a password reset. Click the link below to set a new password.</p>
        <p>This link expires in ${expiresIn} minutes.</p>
        <p><a href="${resetLink}">Reset password</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      `.trim(),
    });
  } catch (err) {
    console.error('[email] Failed to send password reset email:', err);
  }
}

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

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
}

/**
 * Send contact form email to CONTACT_MAIL_TO (e.g. support@). From MAIL_FROM, Reply-To = submitter email.
 * Does not throw; logs errors so API can still return success if DB save succeeded.
 */
export async function sendContactFormEmail(data: ContactFormData): Promise<void> {
  const trans = getTransporter();
  const to = process.env.CONTACT_MAIL_TO;
  if (!trans || !to) {
    if (!to) console.warn('[email] CONTACT_MAIL_TO not set; skipping contact form email.');
    else console.warn('[email] SMTP not configured; skipping contact form email.');
    return;
  }
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
  const phone = data.phone ?? 'Not provided';
  const subject = `Contact form: ${data.subject}`;
  const text = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${phone}`,
    `Subject: ${data.subject}`,
    '',
    'Message:',
    data.message,
  ].join('\n');
  const html = [
    '<p><strong>Name:</strong> ' + escapeHtml(data.name) + '</p>',
    '<p><strong>Email:</strong> ' + escapeHtml(data.email) + '</p>',
    '<p><strong>Phone:</strong> ' + escapeHtml(phone) + '</p>',
    '<p><strong>Subject:</strong> ' + escapeHtml(data.subject) + '</p>',
    '<p><strong>Message:</strong></p>',
    '<p>' + escapeHtml(data.message).replace(/\n/g, '<br>') + '</p>',
  ].join('\n');
  try {
    await trans.sendMail({
      from,
      to,
      replyTo: data.email,
      subject,
      text,
      html,
    });
  } catch (err) {
    console.error('[email] Failed to send contact form email:', err);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

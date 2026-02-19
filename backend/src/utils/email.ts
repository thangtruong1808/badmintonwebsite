import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  const host = (process.env.SMTP_HOST ?? '').trim();
  const port = (process.env.SMTP_PORT ?? '').trim();
  const user = (process.env.SMTP_USER ?? '').trim();
  const pass = (process.env.SMTP_PASS ?? '').trim();
  if (!host || !port || !user || !pass) return null;
  const portNum = parseInt(port, 10);
  // Port 465: direct TLS. Port 587: STARTTLS (requireTLS needed for some servers e.g. Hostinger).
  const useSecure = process.env.SMTP_SECURE === 'true' && portNum === 465;
  const transportOptions: Parameters<typeof nodemailer.createTransport>[0] = {
    host,
    port: portNum,
    secure: useSecure,
    auth: { user, pass },
  };
  if (portNum === 587 && !useSecure) {
    (transportOptions as Record<string, unknown>).requireTLS = true;
  }
  transporter = nodemailer.createTransport(transportOptions);
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
  } catch (err: unknown) {
    const isAuth = err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'EAUTH';
    console.error('[email] Failed to send password reset email:', err);
    if (isAuth) {
      console.error('[email] SMTP auth failed (535). Check SMTP_USER and SMTP_PASS in .env. For Hostinger: use the mailbox password from hPanel → Emails, ensure the mailbox exists and is active.');
    }
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

export interface ServiceRequestEmailData {
  name: string;
  email: string;
  phone: string;
  racket_brand: string;
  racket_model: string;
  string_type: string;
  string_colour: string | null;
  tension: string;
  stencil: boolean;
  grip: boolean;
  message: string | null;
}

/**
 * Send stringing service request email to CONTACT_MAIL_TO. Reply-To = submitter email.
 * Does not throw; logs errors.
 */
export async function sendServiceRequestEmail(data: ServiceRequestEmailData): Promise<void> {
  const trans = getTransporter();
  const to = process.env.CONTACT_MAIL_TO;
  if (!trans || !to) {
    if (!to) console.warn('[email] CONTACT_MAIL_TO not set; skipping service request email.');
    else console.warn('[email] SMTP not configured; skipping service request email.');
    return;
  }
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
  const subject = 'Stringing Service Request - ChibiBadminton';
  const extras: string[] = [];
  if (data.stencil) extras.push('Stencil');
  if (data.grip) extras.push('Grip');
  const text = [
    'Stringing Service Request',
    '',
    'Name: ' + data.name,
    'Email: ' + data.email,
    'Phone: ' + data.phone,
    '',
    'Racket Brand: ' + data.racket_brand,
    'Racket Model: ' + data.racket_model,
    'String: ' + data.string_type,
    data.string_colour ? 'Colour: ' + data.string_colour : '',
    'Tension: ' + data.tension,
    extras.length ? 'Extras: ' + extras.join(', ') : '',
    '',
    data.message ? 'Additional notes:\n' + data.message : '',
  ].filter(Boolean).join('\n');
  const html = [
    '<h2>Stringing Service Request</h2>',
    '<p><strong>Name:</strong> ' + escapeHtml(data.name) + '</p>',
    '<p><strong>Email:</strong> ' + escapeHtml(data.email) + '</p>',
    '<p><strong>Phone:</strong> ' + escapeHtml(data.phone) + '</p>',
    '<p><strong>Racket Brand:</strong> ' + escapeHtml(data.racket_brand) + '</p>',
    '<p><strong>Racket Model:</strong> ' + escapeHtml(data.racket_model) + '</p>',
    '<p><strong>String:</strong> ' + escapeHtml(data.string_type) + '</p>',
    data.string_colour ? '<p><strong>Colour:</strong> ' + escapeHtml(data.string_colour) + '</p>' : '',
    '<p><strong>Tension:</strong> ' + escapeHtml(data.tension) + '</p>',
    extras.length ? '<p><strong>Extras:</strong> ' + escapeHtml(extras.join(', ')) + '</p>' : '',
    data.message ? '<p><strong>Additional notes:</strong></p><p>' + escapeHtml(data.message).replace(/\n/g, '<br>') + '</p>' : '',
  ].filter(Boolean).join('\n');
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
    console.error('[email] Failed to send service request email:', err);
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

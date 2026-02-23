import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  const host = (process.env.SMTP_HOST ?? '').trim().replace(/[\x00-\x1F\x7F]/g, '');
  const port = (process.env.SMTP_PORT ?? '').trim().replace(/[\x00-\x1F\x7F]/g, '');
  const user = (process.env.SMTP_USER ?? '').trim().replace(/[\x00-\x1F\x7F]/g, '');
  const pass = (process.env.SMTP_PASS ?? '').trim().replace(/[\x00-\x1F\x7F]/g, '');
  if (!host || !port || !user || !pass) return null;
  const portNum = parseInt(port, 10);
  // Port 465: direct TLS. Port 587: STARTTLS (requireTLS needed for some servers e.g. Hostinger).
  const useSecure = process.env.SMTP_SECURE === 'true' && portNum === 465;
  const options = {
    host,
    port: portNum,
    secure: useSecure,
    auth: { user, pass },
    ...(portNum === 587 && !useSecure ? { requireTLS: true } : {}),
  };
  transporter = nodemailer.createTransport(options as Parameters<typeof nodemailer.createTransport>[0]);
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
      console.error('[email] SMTP auth failed (535). Verify: 1) SMTP_USER is the real mailbox (not alias). 2) SMTP_PASS is correct - try a simple password (letters+numbers) to rule out .env parsing. 3) Try SMTP_HOST=smtp.hostinger.com with port 587, or smtp.titan.email with port 465.');
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

/**
 * Send waitlist promotion email - a spot opened, pay within 24 hours.
 */
export async function sendWaitlistPromotionEmail(
  to: string,
  eventTitle: string,
  eventDate: string,
  paymentLink: string,
  expiresAt: Date
): Promise<void> {
  const trans = getTransporter();
  if (!trans) return;
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
  const subject = 'A spot opened - ChibiBadminton Play Session';
  const text = [
    `Good news! A spot has opened for "${eventTitle}" (${eventDate}).`,
    '',
    'Please complete your payment within 24 hours to confirm your registration:',
    paymentLink,
    '',
    `This offer expires at ${expiresAt.toLocaleString()}.`,
  ].join('\n');
  const html = [
    `<p>Good news! A spot has opened for <strong>${escapeHtml(eventTitle)}</strong> (${escapeHtml(eventDate)}).</p>`,
    '<p>Please complete your payment within 24 hours to confirm your registration:</p>',
    `<p><a href="${escapeHtml(paymentLink)}">Complete payment</a></p>`,
    `<p>This offer expires at ${escapeHtml(expiresAt.toLocaleString())}.</p>`,
  ].join('\n');
  try {
    await trans.sendMail({ from, to, subject, text, html });
  } catch (err) {
    console.error('[email] Failed to send waitlist promotion email:', err);
  }
}

/**
 * Send registration confirmation email after successful payment.
 */
export async function sendRegistrationConfirmationEmail(
  to: string,
  eventTitle: string,
  eventDate: string,
  eventTime?: string,
  eventLocation?: string
): Promise<void> {
  const trans = getTransporter();
  if (!trans) return;
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
  const subject = 'Registration confirmed - ChibiBadminton';
  const details: string[] = [eventDate];
  if (eventTime) details.push(eventTime);
  if (eventLocation) details.push(eventLocation);
  const detailsStr = details.join(' at ');
  const text = [
    `Your registration for "${eventTitle}" is confirmed.`,
    '',
    `Session: ${detailsStr}`,
    '',
    'See you on the court!',
  ].join('\n');
  const html = [
    `<p>Your registration for <strong>${escapeHtml(eventTitle)}</strong> is confirmed.</p>`,
    `<p>Session: ${escapeHtml(detailsStr)}</p>`,
    '<p>See you on the court!</p>',
  ].join('\n');
  try {
    await trans.sendMail({ from, to, subject, text, html });
  } catch (err) {
    console.error('[email] Failed to send registration confirmation email:', err);
  }
}

/**
 * Send email to registered player when their friends on the add-guests waitlist are promoted.
 */
export async function sendFriendsPromotedEmail(
  to: string,
  eventTitle: string,
  eventDate: string,
  count: number
): Promise<void> {
  const trans = getTransporter();
  if (!trans) return;
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
  const friendText = count === 1 ? 'friend has' : 'friends have';
  const subject = 'Your friend(s) have been added - ChibiBadminton';
  const text = [
    `Good news! ${count} of your ${friendText} been added to your registration for "${eventTitle}" (${eventDate}).`,
    '',
    'No further action is required. See you on the court!',
  ].join('\n');
  const html = [
    `<p>Good news! ${count} of your ${friendText} been added to your registration for <strong>${escapeHtml(eventTitle)}</strong> (${escapeHtml(eventDate)}).</p>`,
    '<p>No further action is required. See you on the court!</p>',
  ].join('\n');
  try {
    await trans.sendMail({ from, to, subject, text, html });
  } catch (err) {
    console.error('[email] Failed to send friends promoted email:', err);
  }
}

/**
 * Send confirmation email when registered player updates or removes friends from the waitlist.
 */
export async function sendWaitlistFriendsUpdateConfirmationEmail(
  to: string,
  eventTitle: string,
  eventDate: string,
  reduced: number
): Promise<void> {
  const trans = getTransporter();
  if (!trans) return;
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
  const subject = 'Waitlist update confirmed - ChibiBadminton';
  const friendText = reduced === 1 ? 'friend has' : 'friends have';
  const text = [
    `Your waitlist update for "${eventTitle}" (${eventDate}) is confirmed.`,
    '',
    `${reduced} ${friendText} been removed from the waitlist.`,
  ].join('\n');
  const html = [
    `<p>Your waitlist update for <strong>${escapeHtml(eventTitle)}</strong> (${escapeHtml(eventDate)}) is confirmed.</p>`,
    `<p>${reduced} ${friendText} been removed from the waitlist.</p>`,
  ].join('\n');
  try {
    await trans.sendMail({ from, to, subject, text, html });
  } catch (err) {
    console.error('[email] Failed to send waitlist friends update confirmation email:', err);
  }
}

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

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
  const bodyHtml = `
    <p>You requested a password reset. Click the link below to set a new password.</p>
    <p>This link expires in ${expiresIn} minutes.</p>
    <p><a href="${escapeHtml(resetLink)}" style="color: #be123c; font-weight: 600;">Reset password</a></p>
    <p style="color: #6b7280; font-size: 13px;">If you did not request this, you can ignore this email.</p>
  `.trim();
  try {
    const { html, attachments } = getEmailTemplateWithLogo(bodyHtml);
    await trans.sendMail({
      from,
      to,
      subject: 'Reset your password - ChibiBadminton',
      text: `You requested a password reset. Click the link below to set a new password. This link expires in ${expiresIn} minutes.\n\n${resetLink}\n\nIf you did not request this, you can ignore this email.`,
      html,
      attachments,
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
  const bodyHtml = [
    '<p><strong>Name:</strong> ' + escapeHtml(data.name) + '</p>',
    '<p><strong>Email:</strong> ' + escapeHtml(data.email) + '</p>',
    '<p><strong>Phone:</strong> ' + escapeHtml(phone) + '</p>',
    '<p><strong>Subject:</strong> ' + escapeHtml(data.subject) + '</p>',
    '<p><strong>Message:</strong></p>',
    '<p>' + escapeHtml(data.message).replace(/\n/g, '<br>') + '</p>',
  ].join('\n');
  try {
    const { html, attachments } = getEmailTemplateWithLogo(bodyHtml);
    await trans.sendMail({
      from,
      to,
      replyTo: data.email,
      subject,
      text,
      html,
      attachments,
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
  const bodyHtml = [
    '<h2 style="margin-top: 0; color: #374151;">Stringing Service Request</h2>',
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
    const { html, attachments } = getEmailTemplateWithLogo(bodyHtml);
    await trans.sendMail({
      from,
      to,
      replyTo: data.email,
      subject,
      text,
      html,
      attachments,
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

/** Format date for email display: "March - 12 - 2026" */
function formatDateForEmail(dateStrOrDate: string | Date): string {
  const d = typeof dateStrOrDate === 'string' ? new Date(dateStrOrDate) : dateStrOrDate;
  if (Number.isNaN(d.getTime())) return String(dateStrOrDate);
  const month = d.toLocaleDateString('en-US', { month: 'long' });
  const day = d.getDate();
  const year = d.getFullYear();
  return `${month} - ${day} - ${year}`;
}

/** Format date+time string for email: "March - 12 - 2026 at 7:00 PM" (when input includes time) */
function formatDateOrDateTimeForEmail(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const datePart = formatDateForEmail(d);
  const hasTime = /T|\d{1,2}:\d{2}/.test(dateStr.trim());
  if (!hasTime) return datePart;
  const timePart = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${datePart} at ${timePart}`;
}

/** Format date and time for email: "March - 12 - 2026 at 7:00 PM" */
function formatDateTimeForEmail(dateStrOrDate: string | Date, timeStr?: string): string {
  const datePart = formatDateForEmail(dateStrOrDate);
  if (!timeStr) return datePart;
  return `${datePart} at ${timeStr}`;
}

/** Format Date object for email: "March - 12 - 2026 at 3:45 PM" */
function formatDateObjectForEmail(d: Date): string {
  if (Number.isNaN(d.getTime())) return String(d);
  const datePart = formatDateForEmail(d);
  const timePart = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${datePart} at ${timePart}`;
}

const LOGO_CID = 'chibibadminton.logo@email';

/** Returns logo as CID attachment for reliable display in email clients. Falls back to URL if file missing. */
function getLogoAttachment(): { filename: string; content: Buffer; cid: string } | null {
  const logoPath = join(process.cwd(), 'assets', 'ChibiLogo.png');
  if (!existsSync(logoPath)) return null;
  try {
    const content = readFileSync(logoPath);
    return { filename: 'ChibiLogo.png', content, cid: LOGO_CID };
  } catch {
    return null;
  }
}

/** Returns { html, attachments } for email. Uses CID attachment when logo file exists (most reliable). */
function getEmailTemplateWithLogo(bodyHtml: string): { html: string; attachments: nodemailer.SendMailOptions['attachments'] } {
  const attachment = getLogoAttachment();
  const logoSrc = attachment ? `cid:${LOGO_CID}` : (process.env.LOGO_URL || `${(process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')}/ChibiLogo.png`);
  const headerHtml = `<img src="${escapeHtml(logoSrc)}" alt="ChibiBadminton" width="160" style="max-width: 160px; height: auto; display: block; margin: 0 auto; border: 0;" />`;
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ChibiBadminton</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fdf2f8; color: #374151;">
  <div style="max-width: 600px; margin: 0 auto; padding: 32px 24px;">
    <div style="text-align: center; margin-bottom: 32px;">
      ${headerHtml}
    </div>
    <div style="background: #ffffff; border-radius: 12px; padding: 28px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
      ${bodyHtml}
    </div>
    <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #fce7f3; text-align: center;">
      <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">See you on the court!</p>
      <p style="margin: 0; font-size: 14px; font-weight: 600; color: #be123c;">The ChibiBadminton Team</p>
      <p style="margin: 12px 0 0; font-size: 11px; color: #9ca3af;">support@chibibadminton.com.au</p>
    </div>
  </div>
</body>
</html>`;
  const attachments = attachment ? [attachment] : undefined;
  return { html, attachments };
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
  const eventDateFmt = formatDateOrDateTimeForEmail(eventDate);
  const expiresFmt = formatDateObjectForEmail(expiresAt);
  const text = [
    `Good news! A spot has opened for "${eventTitle}" (${eventDateFmt}).`,
    '',
    'Please complete your payment within 24 hours to confirm your registration:',
    paymentLink,
    '',
    `This offer expires at ${expiresFmt}.`,
  ].join('\n');
  const bodyHtml = [
    `<p>Good news! A spot has opened for <strong>${escapeHtml(eventTitle)}</strong> (${escapeHtml(eventDateFmt)}).</p>`,
    '<p>Please complete your payment within 24 hours to confirm your registration:</p>',
    `<p><a href="${escapeHtml(paymentLink)}" style="display: inline-block; background: #be123c; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">Complete payment</a></p>`,
    `<p style="color: #6b7280; font-size: 13px;">This offer expires at ${escapeHtml(expiresFmt)}.</p>`,
  ].join('\n');
  try {
    const { html, attachments } = getEmailTemplateWithLogo(bodyHtml);
    await trans.sendMail({ from, to, subject, text, html, attachments });
  } catch (err) {
    console.error('[email] Failed to send waitlist promotion email:', err);
  }
}

export interface RegistrationSessionDetails {
  title: string;
  date: string;
  time?: string;
  location?: string;
}

/**
 * Send registration confirmation email after successful payment (single session).
 */
export async function sendRegistrationConfirmationEmail(
  to: string,
  eventTitle: string,
  eventDate: string,
  eventTime?: string,
  eventLocation?: string
): Promise<void> {
  await sendRegistrationConfirmationEmailForSessions(to, [{
    title: eventTitle,
    date: eventDate,
    time: eventTime,
    location: eventLocation,
  }]);
}

/**
 * Send one combined registration confirmation email for one or more sessions.
 */
export async function sendRegistrationConfirmationEmailForSessions(
  to: string,
  sessions: RegistrationSessionDetails[]
): Promise<void> {
  const trans = getTransporter();
  if (!trans) return;
  const toTrimmed = typeof to === 'string' ? to.trim() : '';
  if (!toTrimmed) {
    console.warn('[email] Cannot send registration confirmation: no recipient email');
    return;
  }
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
  const subject = 'Registration confirmed - ChibiBadminton';
  const textParts: string[] = [
    sessions.length === 1
      ? `Your registration for "${sessions[0].title}" is confirmed.`
      : `Your registration for ${sessions.length} sessions is confirmed.`,
    '',
  ];
  const htmlParts: string[] = [
    sessions.length === 1
      ? `<p>Your registration for <strong>${escapeHtml(sessions[0].title)}</strong> is confirmed.</p>`
      : `<p>Your registration for <strong>${sessions.length} sessions</strong> is confirmed.</p>`,
    '<p><strong>Sessions:</strong></p><ul style="margin: 0 0 1em; padding-left: 1.5em;">',
  ];
  for (const s of sessions) {
    const dateFmt = formatDateTimeForEmail(s.date, s.time);
    const detailsStr = s.location ? `${dateFmt} at ${s.location}` : dateFmt;
    textParts.push(`• ${s.title}: ${detailsStr}`);
    htmlParts.push(`<li><strong>${escapeHtml(s.title)}</strong> – ${escapeHtml(detailsStr)}</li>`);
  }
  htmlParts.push('</ul>');
  textParts.push('', 'See you on the court!');
  htmlParts.push('<p>We look forward to seeing you on the court!</p>');
  try {
    const { html, attachments } = getEmailTemplateWithLogo(htmlParts.join(''));
    await trans.sendMail({
      from,
      to: toTrimmed,
      subject,
      text: textParts.join('\n'),
      html,
      attachments,
    });
  } catch (err) {
    console.error('[email] Failed to send registration confirmation email:', err);
  }
}

/**
 * Send confirmation email when user cancels their registration.
 */
export async function sendCancellationConfirmationEmail(
  to: string,
  eventTitle: string,
  eventDate: string,
  eventTime?: string,
  eventLocation?: string
): Promise<void> {
  const trans = getTransporter();
  if (!trans) return;
  const toTrimmed = typeof to === 'string' ? to.trim() : '';
  if (!toTrimmed) {
    console.warn('[email] Cannot send cancellation confirmation: no recipient email');
    return;
  }
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
  const subject = 'Registration cancelled - ChibiBadminton';
  const eventDateFmt = formatDateTimeForEmail(eventDate, eventTime);
  const locationPart = eventLocation ? ` at ${eventLocation}` : '';
  const text = [
    `Your registration for "${eventTitle}" has been cancelled.`,
    '',
    `Session was: ${eventDateFmt}${locationPart}`,
    '',
    'You can register again from the Play or Profile page when spots are available. See you on the court!',
  ].join('\n');
  const bodyHtml = [
    `<p>Your registration for <strong>${escapeHtml(eventTitle)}</strong> has been cancelled.</p>`,
    `<p>Session was: ${escapeHtml(eventDateFmt)}${eventLocation ? ` at ${escapeHtml(eventLocation)}` : ''}</p>`,
    '<p>You can register again from the Play or Profile page when spots are available. We hope to see you on the court soon!</p>',
  ].join('\n');
  try {
    const { html, attachments } = getEmailTemplateWithLogo(bodyHtml);
    await trans.sendMail({ from, to: toTrimmed, subject, text, html, attachments });
  } catch (err) {
    console.error('[email] Failed to send cancellation confirmation email:', err);
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
  const eventDateFmt = formatDateOrDateTimeForEmail(eventDate);
  const text = [
    `Good news! ${count} of your ${friendText} been added to your registration for "${eventTitle}" (${eventDateFmt}).`,
    '',
    'No further action is required. See you on the court!',
  ].join('\n');
  const bodyHtml = [
    `<p>Good news! ${count} of your ${friendText} been added to your registration for <strong>${escapeHtml(eventTitle)}</strong> (${escapeHtml(eventDateFmt)}).</p>`,
    '<p>No further action is required. We look forward to seeing you on the court!</p>',
  ].join('\n');
  try {
    const { html, attachments } = getEmailTemplateWithLogo(bodyHtml);
    await trans.sendMail({ from, to, subject, text, html, attachments });
  } catch (err) {
    console.error('[email] Failed to send friends promoted email:', err);
  }
}

/**
 * Send confirmation email when registered player adds friends to their registration.
 */
export async function sendAddGuestsConfirmationEmail(
  to: string,
  eventTitle: string,
  eventDate: string,
  added: number,
  waitlisted: number
): Promise<void> {
  const trans = getTransporter();
  if (!trans) return;
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
  const subject = 'Friends added to your registration - ChibiBadminton';
  const addedStr = added > 0
    ? `${added} friend${added !== 1 ? 's' : ''} ${added !== 1 ? 'have' : 'has'} been added to your registration.`
    : '';
  const waitlistedStr = waitlisted > 0
    ? `${waitlisted} friend${waitlisted !== 1 ? 's' : ''} ${waitlisted !== 1 ? 'are' : 'is'} on the waitlist (no payment required).`
    : '';
  const eventDateFmt = formatDateOrDateTimeForEmail(eventDate);
  const text = [
    `Your registration for "${eventTitle}" (${eventDateFmt}) has been updated.`,
    '',
    [addedStr, waitlistedStr].filter(Boolean).join(' '),
    '',
    'See you on the court!',
  ].join('\n');
  const bodyHtml = [
    `<p>Your registration for <strong>${escapeHtml(eventTitle)}</strong> (${escapeHtml(eventDateFmt)}) has been updated.</p>`,
    [addedStr, waitlistedStr].filter(Boolean).map((p) => `<p>${escapeHtml(p)}</p>`).join(''),
    '<p>We look forward to seeing you on the court!</p>',
  ].join('\n');
  try {
    const { html, attachments } = getEmailTemplateWithLogo(bodyHtml);
    await trans.sendMail({ from, to, subject, text, html, attachments });
  } catch (err) {
    console.error('[email] Failed to send add guests confirmation email:', err);
  }
}

/**
 * Send confirmation email when registered player removes friends from their registration.
 */
export async function sendRemoveGuestsConfirmationEmail(
  to: string,
  eventTitle: string,
  eventDate: string,
  removed: number,
  promoted: number
): Promise<void> {
  const trans = getTransporter();
  if (!trans) return;
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
  const subject = 'Friends removed from your registration - ChibiBadminton';
  const parts: string[] = [`${removed} friend${removed !== 1 ? 's' : ''} ${removed !== 1 ? 'have' : 'has'} been removed from your registration.`];
  if (promoted > 0) {
    parts.push(`${promoted} spot${promoted !== 1 ? 's' : ''} ${promoted !== 1 ? 'were' : 'was'} offered to the waitlist.`);
  }
  const eventDateFmt = formatDateOrDateTimeForEmail(eventDate);
  const text = [
    `Your registration for "${eventTitle}" (${eventDateFmt}) has been updated.`,
    '',
    parts.join(' '),
    '',
    'See you on the court!',
  ].join('\n');
  const bodyHtml = [
    `<p>Your registration for <strong>${escapeHtml(eventTitle)}</strong> (${escapeHtml(eventDateFmt)}) has been updated.</p>`,
    `<p>${parts.map((p) => escapeHtml(p)).join(' ')}</p>`,
    '<p>We look forward to seeing you on the court!</p>',
  ].join('\n');
  try {
    const { html, attachments } = getEmailTemplateWithLogo(bodyHtml);
    await trans.sendMail({ from, to, subject, text, html, attachments });
  } catch (err) {
    console.error('[email] Failed to send remove guests confirmation email:', err);
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
  const eventDateFmt = formatDateOrDateTimeForEmail(eventDate);
  const text = [
    `Your waitlist update for "${eventTitle}" (${eventDateFmt}) is confirmed.`,
    '',
    `${reduced} ${friendText} been removed from the waitlist.`,
  ].join('\n');
  const bodyHtml = [
    `<p>Your waitlist update for <strong>${escapeHtml(eventTitle)}</strong> (${escapeHtml(eventDateFmt)}) is confirmed.</p>`,
    `<p>${reduced} ${friendText} been removed from the waitlist.</p>`,
  ].join('\n');
  try {
    const { html, attachments } = getEmailTemplateWithLogo(bodyHtml);
    await trans.sendMail({ from, to, subject, text, html, attachments });
  } catch (err) {
    console.error('[email] Failed to send waitlist friends update confirmation email:', err);
  }
}

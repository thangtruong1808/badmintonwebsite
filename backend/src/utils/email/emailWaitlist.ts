/**
 * Waitlist promotion email - spot opened; confirm registration (no payment reminder).
 */
import { getTransporter, getEmailTemplateWithLogo } from './emailTransporter.js';
import { escapeHtml, extractFirstName, formatPlaytimeLineForEmail, formatDateObjectForEmail, parseDateAndTimeForEmail } from './emailUtils.js';

/**
 * Send waitlist promotion email.
 * recipientName: optional first name for personalization.
 * eventLocation: optional venue address for the playtime line.
 */
export async function sendWaitlistPromotionEmail(
  to: string,
  eventTitle: string,
  eventDate: string,
  paymentLink: string,
  expiresAt: Date,
  recipientName?: string | null,
  eventLocation?: string | null
): Promise<void> {
  const trans = getTransporter();
  if (!trans) return;
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
  const firstName = extractFirstName(recipientName);
  const greeting = `Hi ${firstName.charAt(0).toUpperCase() + firstName.slice(1)},`;
  const subject = 'A spot opened - ChibiBadminton Play Session';
  const { date: d, time: t } = parseDateAndTimeForEmail(eventDate);
  const playtimeLine = formatPlaytimeLineForEmail(d, t, eventLocation ?? undefined);
  const expiresFmt = formatDateObjectForEmail(expiresAt);
  const text = [
    greeting,
    '',
    `Good news! A spot has opened for "${eventTitle}".`,
    '',
    playtimeLine,
    '',
    'Please confirm your registration using the link below. This offer expires at ' + expiresFmt + '.',
    '',
    paymentLink,
    '',
    'We look forward to seeing you on the court!',
  ].join('\n');
  const bodyHtml = [
    `<p>${escapeHtml(greeting)}</p>`,
    `<p>Good news! A spot has opened for <strong>${escapeHtml(eventTitle)}</strong>.</p>`,
    `<p>${escapeHtml(playtimeLine)}</p>`,
    `<p>Please confirm your registration using the link below. This offer expires at ${escapeHtml(expiresFmt)}.</p>`,
    `<p><a href="${escapeHtml(paymentLink)}" style="display: inline-block; background: #be123c; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">Confirm my spot</a></p>`,
    '<p>We look forward to seeing you on the court!</p>',
  ].join('\n');
  try {
    const { html, attachments } = getEmailTemplateWithLogo(bodyHtml);
    await trans.sendMail({ from, to, subject, text, html, attachments });
  } catch (err) {
    console.error('[email] Failed to send waitlist promotion email:', err);
  }
}

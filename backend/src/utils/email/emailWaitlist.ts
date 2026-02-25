/**
 * Waitlist promotion email - spot opened, pay within 24 hours.
 */
import { getTransporter, getEmailTemplateWithLogo } from './emailTransporter.js';
import { escapeHtml, extractFirstName, formatDateOrDateTimeForEmail, formatDateObjectForEmail } from './emailUtils.js';

/**
 * Send waitlist promotion email.
 * recipientName: optional first name for personalization.
 */
export async function sendWaitlistPromotionEmail(
  to: string,
  eventTitle: string,
  eventDate: string,
  paymentLink: string,
  expiresAt: Date,
  recipientName?: string | null
): Promise<void> {
  const trans = getTransporter();
  if (!trans) return;
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
  const firstName = extractFirstName(recipientName);
  const greeting = `Hey ${firstName.charAt(0).toUpperCase() + firstName.slice(1)},`;
  const subject = 'A spot opened - ChibiBadminton Play Session';
  const eventDateFmt = formatDateOrDateTimeForEmail(eventDate);
  const expiresFmt = formatDateObjectForEmail(expiresAt);
  const text = [
    greeting,
    '',
    `Good news! A spot has opened for "${eventTitle}" (${eventDateFmt}).`,
    '',
    'Please complete your payment within 24 hours to confirm your registration:',
    paymentLink,
    '',
    `This offer expires at ${expiresFmt}.`,
  ].join('\n');
  const bodyHtml = [
    `<p>${escapeHtml(greeting)}</p>`,
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

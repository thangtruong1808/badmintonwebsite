/**
 * Add-guests / friends related emails.
 */
import { getTransporter, getEmailTemplateWithLogo } from './emailTransporter.js';
import { escapeHtml, extractFirstName, formatDateOrDateTimeForEmail } from './emailUtils.js';

/**
 * Send email when friends on the add-guests waitlist are promoted.
 */
export async function sendFriendsPromotedEmail(
  to: string,
  eventTitle: string,
  eventDate: string,
  count: number,
  recipientName?: string | null
): Promise<void> {
  const trans = getTransporter();
  if (!trans) return;
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
  const firstName = extractFirstName(recipientName);
  const greeting = `Hey ${firstName.charAt(0).toUpperCase() + firstName.slice(1)},`;
  const friendText = count === 1 ? 'friend has' : 'friends have';
  const subject = 'Your friend(s) have been added - ChibiBadminton';
  const eventDateFmt = formatDateOrDateTimeForEmail(eventDate);
  const text = [
    greeting,
    '',
    `Good news! ${count} of your ${friendText} been added to your registration for "${eventTitle}" (${eventDateFmt}).`,
    '',
    'No further action is required. See you on the court!',
  ].join('\n');
  const bodyHtml = [
    `<p>${escapeHtml(greeting)}</p>`,
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
 * Send confirmation when registered player adds friends to their registration.
 */
export async function sendAddGuestsConfirmationEmail(
  to: string,
  eventTitle: string,
  eventDate: string,
  added: number,
  waitlisted: number,
  recipientName?: string | null
): Promise<void> {
  const trans = getTransporter();
  if (!trans) return;
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
  const firstName = extractFirstName(recipientName);
  const greeting = `Hey ${firstName.charAt(0).toUpperCase() + firstName.slice(1)},`;
  const subject = 'Friends added to your registration - ChibiBadminton';
  const addedStr =
    added > 0
      ? `${added} friend${added !== 1 ? 's' : ''} ${added !== 1 ? 'have' : 'has'} been added to your registration.`
      : '';
  const waitlistedStr =
    waitlisted > 0
      ? `${waitlisted} friend${waitlisted !== 1 ? 's' : ''} ${waitlisted !== 1 ? 'are' : 'is'} on the waitlist (no payment required).`
      : '';
  const eventDateFmt = formatDateOrDateTimeForEmail(eventDate);
  const text = [
    greeting,
    '',
    `Your registration for "${eventTitle}" (${eventDateFmt}) has been updated.`,
    '',
    [addedStr, waitlistedStr].filter(Boolean).join(' '),
    '',
    'See you on the court!',
  ].join('\n');
  const bodyHtml = [
    `<p>${escapeHtml(greeting)}</p>`,
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
 * Send confirmation when registered player removes friends from their registration.
 */
export async function sendRemoveGuestsConfirmationEmail(
  to: string,
  eventTitle: string,
  eventDate: string,
  removed: number,
  promoted: number,
  recipientName?: string | null
): Promise<void> {
  const trans = getTransporter();
  if (!trans) return;
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
  const firstName = extractFirstName(recipientName);
  const greeting = `Hey ${firstName.charAt(0).toUpperCase() + firstName.slice(1)},`;
  const subject = 'Friends removed from your registration - ChibiBadminton';
  const parts: string[] = [
    `${removed} friend${removed !== 1 ? 's' : ''} ${removed !== 1 ? 'have' : 'has'} been removed from your registration.`,
  ];
  if (promoted > 0) {
    parts.push(`${promoted} spot${promoted !== 1 ? 's' : ''} ${promoted !== 1 ? 'were' : 'was'} offered to the waitlist.`);
  }
  const eventDateFmt = formatDateOrDateTimeForEmail(eventDate);
  const text = [
    greeting,
    '',
    `Your registration for "${eventTitle}" (${eventDateFmt}) has been updated.`,
    '',
    parts.join(' '),
    '',
    'See you on the court!',
  ].join('\n');
  const bodyHtml = [
    `<p>${escapeHtml(greeting)}</p>`,
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
 * Send confirmation when registered player updates or removes friends from the waitlist.
 */
export async function sendWaitlistFriendsUpdateConfirmationEmail(
  to: string,
  eventTitle: string,
  eventDate: string,
  reduced: number,
  recipientName?: string | null
): Promise<void> {
  const trans = getTransporter();
  if (!trans) return;
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
  const firstName = extractFirstName(recipientName);
  const greeting = `Hey ${firstName.charAt(0).toUpperCase() + firstName.slice(1)},`;
  const subject = 'Waitlist update confirmed - ChibiBadminton';
  const friendText = reduced === 1 ? 'friend has' : 'friends have';
  const eventDateFmt = formatDateOrDateTimeForEmail(eventDate);
  const text = [
    greeting,
    '',
    `Your waitlist update for "${eventTitle}" (${eventDateFmt}) is confirmed.`,
    '',
    `${reduced} ${friendText} been removed from the waitlist.`,
  ].join('\n');
  const bodyHtml = [
    `<p>${escapeHtml(greeting)}</p>`,
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
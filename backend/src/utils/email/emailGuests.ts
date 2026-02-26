/**
 * Add-guests / friends related emails.
 */
import { getTransporter, getEmailTemplateWithLogo } from './emailTransporter.js';
import { escapeHtml, extractFirstName, formatPlaytimeLineForEmail, parseDateAndTimeForEmail } from './emailUtils.js';

/**
 * Send email when friends on the add-guests waitlist are promoted.
 */
export async function sendFriendsPromotedEmail(
  to: string,
  eventTitle: string,
  eventDate: string,
  count: number,
  recipientName?: string | null,
  eventLocation?: string | null
): Promise<void> {
  const trans = getTransporter();
  if (!trans) return;
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
  const firstName = extractFirstName(recipientName);
  const greeting = `Hi ${firstName.charAt(0).toUpperCase() + firstName.slice(1)},`;
  const friendText = count === 1 ? 'friend has' : 'friends have';
  const subject = 'Your friend(s) have been added - ChibiBadminton';
  const { date: d, time: t } = parseDateAndTimeForEmail(eventDate);
  const playtimeLine = formatPlaytimeLineForEmail(d, t, eventLocation ?? undefined);
  const text = [
    greeting,
    '',
    `Good news! ${count} ${friendText} been added to your registration.`,
    '',
    `Session: ${eventTitle} — ${playtimeLine}.`,
    '',
    'We look forward to seeing you on the court!',
  ].join('\n');
  const bodyHtml = [
    `<p>${escapeHtml(greeting)}</p>`,
    `<p>Good news! ${count} ${friendText} been added to your registration.</p>`,
    `<p><strong>${escapeHtml(eventTitle)}</strong> — ${escapeHtml(playtimeLine)}.</p>`,
    '<p>We look forward to seeing you on the court!</p>',
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
 * All friends (including those on the waitlist) are paid in advance; no payment reminder.
 */
export async function sendAddGuestsConfirmationEmail(
  to: string,
  eventTitle: string,
  eventDate: string,
  added: number,
  waitlisted: number,
  recipientName?: string | null,
  eventLocation?: string | null
): Promise<void> {
  const trans = getTransporter();
  if (!trans) return;
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
  const firstName = extractFirstName(recipientName);
  const greeting = `Hi ${firstName.charAt(0).toUpperCase() + firstName.slice(1)},`;
  const subject = 'Friends added to your registration - ChibiBadminton';
  const { date: d, time: t } = parseDateAndTimeForEmail(eventDate);
  const playtimeLine = formatPlaytimeLineForEmail(d, t, eventLocation ?? undefined);
  const summaryParts: string[] = [];
  if (added > 0) {
    summaryParts.push(`${added} friend${added !== 1 ? 's' : ''} ${added !== 1 ? 'have' : 'has'} been added to your registration.`);
  }
  if (waitlisted > 0) {
    summaryParts.push(`${waitlisted} friend${waitlisted !== 1 ? 's' : ''} ${waitlisted !== 1 ? 'are' : 'is'} on the waitlist and will be added when spots open.`);
  }
  const summary = summaryParts.join(' ');
  const text = [
    greeting,
    '',
    `Your registration has been updated for "${eventTitle}".`,
    '',
    playtimeLine,
    '',
    summary,
    '',
    'We look forward to seeing you on the court!',
  ].join('\n');
  const bodyHtml = [
    `<p>${escapeHtml(greeting)}</p>`,
    `<p>Your registration has been updated for <strong>${escapeHtml(eventTitle)}</strong>.</p>`,
    `<p>${escapeHtml(playtimeLine)}</p>`,
    summary ? `<p>${escapeHtml(summary)}</p>` : '',
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
  recipientName?: string | null,
  eventLocation?: string | null
): Promise<void> {
  const trans = getTransporter();
  if (!trans) return;
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
  const firstName = extractFirstName(recipientName);
  const greeting = `Hi ${firstName.charAt(0).toUpperCase() + firstName.slice(1)},`;
  const subject = 'Friends removed from your registration - ChibiBadminton';
  const { date: d, time: t } = parseDateAndTimeForEmail(eventDate);
  const playtimeLine = formatPlaytimeLineForEmail(d, t, eventLocation ?? undefined);
  const removedStr = `${removed} friend${removed !== 1 ? 's' : ''} ${removed !== 1 ? 'have' : 'has'} been removed from your registration.`;
  const promotedStr = promoted > 0
    ? `${promoted} spot${promoted !== 1 ? 's' : ''} ${promoted !== 1 ? 'were' : 'was'} offered to the waitlist.`
    : '';
  const text = [
    greeting,
    '',
    `Your registration for "${eventTitle}" has been updated.`,
    '',
    playtimeLine,
    '',
    removedStr,
    ...(promotedStr ? ['', promotedStr] : []),
    '',
    'We look forward to seeing you on the court!',
  ].join('\n');
  const bodyHtml = [
    `<p>${escapeHtml(greeting)}</p>`,
    `<p>Your registration for <strong>${escapeHtml(eventTitle)}</strong> has been updated.</p>`,
    `<p>${escapeHtml(playtimeLine)}</p>`,
    `<p>${escapeHtml(removedStr)}${promotedStr ? ` ${escapeHtml(promotedStr)}` : ''}</p>`,
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
  recipientName?: string | null,
  eventLocation?: string | null
): Promise<void> {
  const trans = getTransporter();
  if (!trans) return;
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
  const firstName = extractFirstName(recipientName);
  const greeting = `Hi ${firstName.charAt(0).toUpperCase() + firstName.slice(1)},`;
  const subject = 'Waitlist update confirmed - ChibiBadminton';
  const friendText = reduced === 1 ? 'friend has' : 'friends have';
  const { date: d, time: t } = parseDateAndTimeForEmail(eventDate);
  const playtimeLine = formatPlaytimeLineForEmail(d, t, eventLocation ?? undefined);
  const text = [
    greeting,
    '',
    `Your waitlist update for "${eventTitle}" is confirmed.`,
    '',
    playtimeLine,
    '',
    `${reduced} ${friendText} been removed from the waitlist.`,
    '',
    'We look forward to seeing you on the court!',
  ].join('\n');
  const bodyHtml = [
    `<p>${escapeHtml(greeting)}</p>`,
    `<p>Your waitlist update for <strong>${escapeHtml(eventTitle)}</strong> is confirmed.</p>`,
    `<p>${escapeHtml(playtimeLine)}</p>`,
    `<p>${reduced} ${friendText} been removed from the waitlist.</p>`,
    '<p>We look forward to seeing you on the court!</p>',
  ].join('\n');
  try {
    const { html, attachments } = getEmailTemplateWithLogo(bodyHtml);
    await trans.sendMail({ from, to, subject, text, html, attachments });
  } catch (err) {
    console.error('[email] Failed to send waitlist friends update confirmation email:', err);
  }
}
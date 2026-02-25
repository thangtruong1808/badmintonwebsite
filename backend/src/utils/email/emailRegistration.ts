/**
 * Registration-related emails: confirmation, cancellation.
 */
import { getTransporter, getEmailTemplateWithLogo } from './emailTransporter.js';
import { escapeHtml, extractFirstName, formatDateTimeForEmail, formatDateOrDateTimeForEmail } from './emailUtils.js';

export interface RegistrationSessionDetails {
  title: string;
  date: string;
  time?: string;
  location?: string;
}

/**
 * Send registration confirmation email (single session).
 */
export async function sendRegistrationConfirmationEmail(
  to: string,
  eventTitle: string,
  eventDate: string,
  eventTime?: string,
  eventLocation?: string,
  recipientName?: string | null
): Promise<void> {
  await sendRegistrationConfirmationEmailForSessions(
    to,
    [{ title: eventTitle, date: eventDate, time: eventTime, location: eventLocation }],
    recipientName
  );
}

/**
 * Send one combined registration confirmation email for one or more sessions.
 */
export async function sendRegistrationConfirmationEmailForSessions(
  to: string,
  sessions: RegistrationSessionDetails[],
  recipientName?: string | null
): Promise<void> {
  const trans = getTransporter();
  if (!trans) return;
  const toTrimmed = typeof to === 'string' ? to.trim() : '';
  if (!toTrimmed) {
    console.warn('[email] Cannot send registration confirmation: no recipient email');
    return;
  }
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
  const firstName = extractFirstName(recipientName);
  const greeting = `Hey ${firstName.charAt(0).toUpperCase() + firstName.slice(1)},`;
  const subject = 'Registration confirmed - ChibiBadminton';
  const textParts: string[] = [greeting, ''];
  const htmlParts: string[] = [`<p>${escapeHtml(greeting)}</p>`];
  textParts.push(
    sessions.length === 1
      ? `Your registration for "${sessions[0].title}" is confirmed.`
      : `Your registration for ${sessions.length} sessions is confirmed.`
  );
  htmlParts.push(
    sessions.length === 1
      ? `<p>Your registration for <strong>${escapeHtml(sessions[0].title)}</strong> is confirmed.</p>`
      : `<p>Your registration for <strong>${sessions.length} sessions</strong> is confirmed.</p>`
  );
  htmlParts.push('<p><strong>Sessions:</strong></p><ul style="margin: 0 0 1em; padding-left: 1.5em;">');
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
  eventLocation?: string,
  recipientName?: string | null
): Promise<void> {
  const trans = getTransporter();
  if (!trans) return;
  const toTrimmed = typeof to === 'string' ? to.trim() : '';
  if (!toTrimmed) {
    console.warn('[email] Cannot send cancellation confirmation: no recipient email');
    return;
  }
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
  const firstName = extractFirstName(recipientName);
  const greeting = `Hey ${firstName.charAt(0).toUpperCase() + firstName.slice(1)},`;
  const subject = 'Registration cancelled - ChibiBadminton';
  const eventDateFmt = formatDateTimeForEmail(eventDate, eventTime);
  const locationPart = eventLocation ? ` at ${eventLocation}` : '';
  const text = [
    greeting,
    '',
    `Your registration for "${eventTitle}" has been cancelled.`,
    '',
    `Session was: ${eventDateFmt}${locationPart}`,
    '',
    'You can register again from the Play or Profile page when spots are available. See you on the court!',
  ].join('\n');
  const bodyHtml = [
    `<p>${escapeHtml(greeting)}</p>`,
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

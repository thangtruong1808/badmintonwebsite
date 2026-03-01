/**
 * Registration-related emails: confirmation, cancellation.
 */
import { isEmailConfigured, sendEmail, getEmailTemplateWithLogo } from './emailTransporter.js';
import { escapeHtml, extractFirstName, formatPlaytimeLineForEmail } from './emailUtils.js';

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
  if (!isEmailConfigured()) return;
  const toTrimmed = typeof to === 'string' ? to.trim() : '';
  if (!toTrimmed) {
    console.warn('[email] Cannot send registration confirmation: no recipient email');
    return;
  }
  
  const firstName = extractFirstName(recipientName);
  const greeting = `Hi ${firstName.charAt(0).toUpperCase() + firstName.slice(1)},`;
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
  htmlParts.push('<p><strong>Session details (date, time, location):</strong></p><ul style="margin: 0 0 1em; padding-left: 1.5em;">');
  for (const s of sessions) {
    const detailsStr = formatPlaytimeLineForEmail(s.date, s.time, s.location);
    textParts.push(`• ${s.title}: ${detailsStr}`);
    htmlParts.push(`<li><strong>${escapeHtml(s.title)}</strong> — ${escapeHtml(detailsStr)}</li>`);
  }
  htmlParts.push('</ul>');
  textParts.push('', 'We look forward to seeing you on the court!');
  htmlParts.push('<p>We look forward to seeing you on the court!</p>');
  
  const { html, attachments } = getEmailTemplateWithLogo(htmlParts.join(''));
  const sent = await sendEmail({
    to: toTrimmed,
    subject,
    html,
    text: textParts.join('\n'),
    attachments,
  });
  
  if (!sent) {
    console.error('[email] Failed to send registration confirmation email');
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
  if (!isEmailConfigured()) return;
  const toTrimmed = typeof to === 'string' ? to.trim() : '';
  if (!toTrimmed) {
    console.warn('[email] Cannot send cancellation confirmation: no recipient email');
    return;
  }
  
  const firstName = extractFirstName(recipientName);
  const greeting = `Hi ${firstName.charAt(0).toUpperCase() + firstName.slice(1)},`;
  const subject = 'Registration cancelled - ChibiBadminton';
  const sessionLine = formatPlaytimeLineForEmail(eventDate, eventTime, eventLocation);
  const text = [
    greeting,
    '',
    `Your registration for "${eventTitle}" has been cancelled.`,
    '',
    `Session: ${sessionLine}`,
    '',
    'You can register again from the Play or Profile page when spots are available. We hope to see you on the court soon!',
  ].join('\n');
  const bodyHtml = [
    `<p>${escapeHtml(greeting)}</p>`,
    `<p>Your registration for <strong>${escapeHtml(eventTitle)}</strong> has been cancelled.</p>`,
    `<p>Session: ${escapeHtml(sessionLine)}</p>`,
    '<p>You can register again from the Play or Profile page when spots are available. We hope to see you on the court soon!</p>',
  ].join('\n');
  
  const { html, attachments } = getEmailTemplateWithLogo(bodyHtml);
  const sent = await sendEmail({ to: toTrimmed, subject, html, text, attachments });
  
  if (!sent) {
    console.error('[email] Failed to send cancellation confirmation email');
  }
}

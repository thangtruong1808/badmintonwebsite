/**
 * Auth-related emails: password reset.
 */
import { getTransporter, getEmailTemplateWithLogo } from './emailTransporter.js';
import { escapeHtml, extractFirstName } from './emailUtils.js';

/** Returns true if password reset email is enabled and SMTP is configured. */
export function isPasswordResetEmailEnabled(): boolean {
  if (process.env.SEND_PASSWORD_RESET_EMAIL !== 'true') return false;
  return getTransporter() !== null;
}

/**
 * Send password reset email with link.
 * recipientName: optional first name for personalization.
 */
export async function sendPasswordResetEmail(
  to: string,
  resetLink: string,
  expiresAt: Date,
  recipientName?: string | null
): Promise<void> {
  const trans = getTransporter();
  if (!trans) return;
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
  const firstName = extractFirstName(recipientName);
  const greeting = `Hey ${firstName.charAt(0).toUpperCase() + firstName.slice(1)},`;
  const expiresIn = Math.round((expiresAt.getTime() - Date.now()) / 60000);
  const bodyHtml = `
    <p>${escapeHtml(greeting)}</p>
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
      text: `${greeting}\n\nYou requested a password reset. Click the link below to set a new password. This link expires in ${expiresIn} minutes.\n\n${resetLink}\n\nIf you did not request this, you can ignore this email.`,
      html,
      attachments,
    });
  } catch (err: unknown) {
    const isAuth = err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'EAUTH';
    console.error('[email] Failed to send password reset email:', err);
    if (isAuth) {
      console.error('[email] SMTP auth failed. Verify SMTP_USER, SMTP_PASS, and SMTP settings.');
    }
  }
}

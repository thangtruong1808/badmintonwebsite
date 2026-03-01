/**
 * Auth-related emails: password reset.
 */
import { isEmailConfigured, sendEmail, getEmailTemplateWithLogo } from './emailTransporter.js';
import { escapeHtml, extractFirstName } from './emailUtils.js';

/** Returns true if password reset email is enabled and email provider is configured. */
export function isPasswordResetEmailEnabled(): boolean {
  if (process.env.SEND_PASSWORD_RESET_EMAIL !== 'true') return false;
  return isEmailConfigured();
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
  console.log(`[email] Attempting to send password reset email to: ${to}`);
  
  if (!isEmailConfigured()) {
    console.error('[email] Cannot send password reset email: no email provider configured');
    return;
  }
  
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
  
  const { html, attachments } = getEmailTemplateWithLogo(bodyHtml);
  const text = `${greeting}\n\nYou requested a password reset. Click the link below to set a new password. This link expires in ${expiresIn} minutes.\n\n${resetLink}\n\nIf you did not request this, you can ignore this email.`;
  
  const sent = await sendEmail({
    to,
    subject: 'Reset your password - ChibiBadminton',
    html,
    text,
    attachments,
  });
  
  if (sent) {
    console.log(`[email] Password reset email sent successfully to: ${to}`);
  }
}

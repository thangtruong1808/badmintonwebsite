/**
 * Email transporter, logo attachment, and HTML template wrapper.
 * Supports Resend API (production) with SMTP fallback (local dev).
 */
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { Resend } from 'resend';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { escapeHtml } from './emailUtils.js';

let transporter: Transporter | null = null;
let resendClient: Resend | null = null;

const LOGO_CID = 'chibibadminton.logo@email';

function getResendClient(): Resend | null {
  if (resendClient) return resendClient;
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  console.log('[email] Using Resend API for email delivery');
  resendClient = new Resend(apiKey);
  return resendClient;
}

export function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  const host = (process.env.SMTP_HOST ?? '').trim().replace(/[\x00-\x1F\x7F]/g, '');
  const port = (process.env.SMTP_PORT ?? '').trim().replace(/[\x00-\x1F\x7F]/g, '');
  const user = (process.env.SMTP_USER ?? '').trim().replace(/[\x00-\x1F\x7F]/g, '');
  const pass = (process.env.SMTP_PASS ?? '').trim().replace(/[\x00-\x1F\x7F]/g, '');
  
  if (!host || !port || !user || !pass) {
    const missing = [];
    if (!host) missing.push('SMTP_HOST');
    if (!port) missing.push('SMTP_PORT');
    if (!user) missing.push('SMTP_USER');
    if (!pass) missing.push('SMTP_PASS');
    console.warn(`[email] SMTP not configured. Missing: ${missing.join(', ')}`);
    return null;
  }
  
  const portNum = parseInt(port, 10);
  const useSecure = process.env.SMTP_SECURE === 'true' && portNum === 465;
  const options = {
    host,
    port: portNum,
    secure: useSecure,
    auth: { user, pass },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    ...(portNum === 587 && !useSecure ? { requireTLS: true } : {}),
  };
  
  console.log(`[email] Creating SMTP transporter: ${host}:${portNum} (secure: ${useSecure})`);
  transporter = nodemailer.createTransport(options as Parameters<typeof nodemailer.createTransport>[0]);
  return transporter;
}

export function isEmailConfigured(): boolean {
  return getResendClient() !== null || getTransporter() !== null;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: nodemailer.SendMailOptions['attachments'];
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
  const resend = getResendClient();
  
  if (resend) {
    try {
      await resend.emails.send({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
      });
      console.log(`[email] Email sent via Resend to: ${options.to}`);
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`[email] Resend failed to send email to ${options.to}:`, errorMessage);
      return false;
    }
  }
  
  const smtp = getTransporter();
  if (smtp) {
    try {
      await smtp.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
        attachments: options.attachments,
      });
      console.log(`[email] Email sent via SMTP to: ${options.to}`);
      return true;
    } catch (err: unknown) {
      const errorCode = err && typeof err === 'object' && 'code' in err ? (err as { code?: string }).code : 'UNKNOWN';
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`[email] SMTP failed to send email to ${options.to}:`, errorMessage);
      console.error(`[email] Error code: ${errorCode}`);
      return false;
    }
  }
  
  console.error('[email] No email provider configured (set RESEND_API_KEY or SMTP_* vars)');
  return false;
}

/** Returns logo as CID attachment for reliable display in email clients (SMTP only). */
export function getLogoAttachment(): { filename: string; content: Buffer; cid: string } | null {
  if (getResendClient()) return null;
  const logoPath = join(process.cwd(), 'assets', 'ChibiLogo.png');
  if (!existsSync(logoPath)) return null;
  try {
    const content = readFileSync(logoPath);
    return { filename: 'ChibiLogo.png', content, cid: LOGO_CID };
  } catch {
    return null;
  }
}

function getLogoUrl(): string {
  // If LOGO_URL is explicitly set, use it
  if (process.env.LOGO_URL?.trim()) {
    return process.env.LOGO_URL.trim();
  }
  
  const frontendUrl = (process.env.FRONTEND_URL || '').replace(/\/$/, '').trim();
  
  // If FRONTEND_URL is localhost, use production frontend URL for logo
  // (localhost URLs are not accessible from email clients)
  if (!frontendUrl || frontendUrl.includes('localhost') || frontendUrl.includes('127.0.0.1')) {
    // Fallback to production frontend URL for logo
    const productionUrl = 'https://badmintonwebsitefrontend.vercel.app';
    console.log(`[email] Using production logo URL (localhost not accessible from email clients)`);
    return `${productionUrl}/ChibiLogo.png`;
  }
  
  return `${frontendUrl}/ChibiLogo.png`;
}

/** Returns { html, attachments } for email. Uses URL for Resend, CID attachment for SMTP. */
export function getEmailTemplateWithLogo(
  bodyHtml: string
): { html: string; attachments: nodemailer.SendMailOptions['attachments'] } {
  const attachment = getLogoAttachment();
  const logoSrc = attachment ? `cid:${LOGO_CID}` : getLogoUrl();
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

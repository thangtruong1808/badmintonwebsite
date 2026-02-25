/**
 * Email transporter, logo attachment, and HTML template wrapper.
 */
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { escapeHtml } from './emailUtils.js';

let transporter: Transporter | null = null;

const LOGO_CID = 'chibibadminton.logo@email';

export function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  const host = (process.env.SMTP_HOST ?? '').trim().replace(/[\x00-\x1F\x7F]/g, '');
  const port = (process.env.SMTP_PORT ?? '').trim().replace(/[\x00-\x1F\x7F]/g, '');
  const user = (process.env.SMTP_USER ?? '').trim().replace(/[\x00-\x1F\x7F]/g, '');
  const pass = (process.env.SMTP_PASS ?? '').trim().replace(/[\x00-\x1F\x7F]/g, '');
  if (!host || !port || !user || !pass) return null;
  const portNum = parseInt(port, 10);
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

/** Returns logo as CID attachment for reliable display in email clients. */
export function getLogoAttachment(): { filename: string; content: Buffer; cid: string } | null {
  const logoPath = join(process.cwd(), 'assets', 'ChibiLogo.png');
  if (!existsSync(logoPath)) return null;
  try {
    const content = readFileSync(logoPath);
    return { filename: 'ChibiLogo.png', content, cid: LOGO_CID };
  } catch {
    return null;
  }
}

/** Returns { html, attachments } for email. Uses CID attachment when logo exists. */
export function getEmailTemplateWithLogo(
  bodyHtml: string
): { html: string; attachments: nodemailer.SendMailOptions['attachments'] } {
  const attachment = getLogoAttachment();
  const logoSrc = attachment
    ? `cid:${LOGO_CID}`
    : (process.env.LOGO_URL || `${(process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')}/ChibiLogo.png`);
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

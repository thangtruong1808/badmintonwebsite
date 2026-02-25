/**
 * Contact form and service request emails (sent to admin/support).
 */
import { getTransporter, getEmailTemplateWithLogo } from './emailTransporter.js';
import { escapeHtml } from './emailUtils.js';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
}

/**
 * Send contact form email to CONTACT_MAIL_TO.
 */
export async function sendContactFormEmail(data: ContactFormData): Promise<void> {
  const trans = getTransporter();
  const to = process.env.CONTACT_MAIL_TO;
  if (!trans || !to) {
    if (!to) console.warn('[email] CONTACT_MAIL_TO not set; skipping contact form email.');
    else console.warn('[email] SMTP not configured; skipping contact form email.');
    return;
  }
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
  const phone = data.phone ?? 'Not provided';
  const subject = `Contact form: ${data.subject}`;
  const text = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${phone}`,
    `Subject: ${data.subject}`,
    '',
    'Message:',
    data.message,
  ].join('\n');
  const bodyHtml = [
    '<p><strong>Name:</strong> ' + escapeHtml(data.name) + '</p>',
    '<p><strong>Email:</strong> ' + escapeHtml(data.email) + '</p>',
    '<p><strong>Phone:</strong> ' + escapeHtml(phone) + '</p>',
    '<p><strong>Subject:</strong> ' + escapeHtml(data.subject) + '</p>',
    '<p><strong>Message:</strong></p>',
    '<p>' + escapeHtml(data.message).replace(/\n/g, '<br>') + '</p>',
  ].join('\n');
  try {
    const { html, attachments } = getEmailTemplateWithLogo(bodyHtml);
    await trans.sendMail({
      from,
      to,
      replyTo: data.email,
      subject,
      text,
      html,
      attachments,
    });
  } catch (err) {
    console.error('[email] Failed to send contact form email:', err);
  }
}

export interface ServiceRequestEmailData {
  name: string;
  email: string;
  phone: string;
  racket_brand: string;
  racket_model: string;
  string_type: string;
  string_colour: string | null;
  tension: string;
  stencil: boolean;
  grip: boolean;
  message: string | null;
}

/**
 * Send stringing service request email to CONTACT_MAIL_TO.
 */
export async function sendServiceRequestEmail(data: ServiceRequestEmailData): Promise<void> {
  const trans = getTransporter();
  const to = process.env.CONTACT_MAIL_TO;
  if (!trans || !to) {
    if (!to) console.warn('[email] CONTACT_MAIL_TO not set; skipping service request email.');
    else console.warn('[email] SMTP not configured; skipping service request email.');
    return;
  }
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
  const subject = 'Stringing Service Request - ChibiBadminton';
  const extras: string[] = [];
  if (data.stencil) extras.push('Stencil');
  if (data.grip) extras.push('Grip');
  const text = [
    'Stringing Service Request',
    '',
    'Name: ' + data.name,
    'Email: ' + data.email,
    'Phone: ' + data.phone,
    '',
    'Racket Brand: ' + data.racket_brand,
    'Racket Model: ' + data.racket_model,
    'String: ' + data.string_type,
    data.string_colour ? 'Colour: ' + data.string_colour : '',
    'Tension: ' + data.tension,
    extras.length ? 'Extras: ' + extras.join(', ') : '',
    '',
    data.message ? 'Additional notes:\n' + data.message : '',
  ]
    .filter(Boolean)
    .join('\n');
  const bodyHtml = [
    '<h2 style="margin-top: 0; color: #374151;">Stringing Service Request</h2>',
    '<p><strong>Name:</strong> ' + escapeHtml(data.name) + '</p>',
    '<p><strong>Email:</strong> ' + escapeHtml(data.email) + '</p>',
    '<p><strong>Phone:</strong> ' + escapeHtml(data.phone) + '</p>',
    '<p><strong>Racket Brand:</strong> ' + escapeHtml(data.racket_brand) + '</p>',
    '<p><strong>Racket Model:</strong> ' + escapeHtml(data.racket_model) + '</p>',
    '<p><strong>String:</strong> ' + escapeHtml(data.string_type) + '</p>',
    data.string_colour ? '<p><strong>Colour:</strong> ' + escapeHtml(data.string_colour) + '</p>' : '',
    '<p><strong>Tension:</strong> ' + escapeHtml(data.tension) + '</p>',
    extras.length ? '<p><strong>Extras:</strong> ' + escapeHtml(extras.join(', ')) + '</p>' : '',
    data.message
      ? '<p><strong>Additional notes:</strong></p><p>' + escapeHtml(data.message).replace(/\n/g, '<br>') + '</p>'
      : '',
  ]
    .filter(Boolean)
    .join('\n');
  try {
    const { html, attachments } = getEmailTemplateWithLogo(bodyHtml);
    await trans.sendMail({
      from,
      to,
      replyTo: data.email,
      subject,
      text,
      html,
      attachments,
    });
  } catch (err) {
    console.error('[email] Failed to send service request email:', err);
  }
}

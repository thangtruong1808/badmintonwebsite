/**
 * Shop order confirmation email.
 */
import { isEmailConfigured, sendEmail, getEmailTemplateWithLogo } from './emailTransporter.js';
import { escapeHtml, extractFirstName } from './emailUtils.js';
import type { OrderRow, OrderItem } from '../../services/orderService.js';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount);
}

/**
 * Send order confirmation email after successful shop purchase.
 */
export async function sendShopOrderConfirmationEmail(
  to: string,
  order: OrderRow & { items?: OrderItem[] },
  recipientName?: string | null
): Promise<void> {
  if (!isEmailConfigured()) return;
  const toTrimmed = typeof to === 'string' ? to.trim() : '';
  if (!toTrimmed) {
    console.warn('[email] Cannot send shop order confirmation: no recipient email');
    return;
  }

  const firstName = extractFirstName(recipientName);
  const greeting = `Hi ${firstName.charAt(0).toUpperCase() + firstName.slice(1)},`;
  const subject = 'Order confirmed - ChibiBadminton';

  const textParts: string[] = [
    greeting,
    '',
    'Thank you for your purchase! Your order has been confirmed.',
    '',
    `Order ID: ${order.id}`,
    '',
    'Items:',
  ];

  const htmlParts: string[] = [
    `<p>${escapeHtml(greeting)}</p>`,
    '<p>Thank you for your purchase! Your order has been confirmed.</p>',
    `<p><strong>Order ID:</strong> ${escapeHtml(order.id)}</p>`,
    '<p><strong>Items:</strong></p>',
    '<ul style="margin: 0 0 1em; padding-left: 1.5em;">',
  ];

  const items = order.items ?? [];
  for (const item of items) {
    const name = item.product_name ?? 'Product';
    const lineTotal = item.quantity * item.unit_price;
    const line = `• ${name} x ${item.quantity} – ${formatCurrency(lineTotal)}`;
    textParts.push(line);
    htmlParts.push(
      `<li>${escapeHtml(name)} × ${item.quantity} – ${escapeHtml(formatCurrency(lineTotal))}</li>`
    );
  }

  textParts.push('', `Total: ${formatCurrency(order.total)}`);
  htmlParts.push('</ul>');
  htmlParts.push(`<p><strong>Total:</strong> ${escapeHtml(formatCurrency(order.total))}</p>`);

  textParts.push(
    '',
    'We will notify you when your order is ready for pickup or shipment. If you have any questions, please contact us at support@chibibadminton.com.au.'
  );
  htmlParts.push(
    '<p>We will notify you when your order is ready for pickup or shipment. If you have any questions, please contact us at <a href="mailto:support@chibibadminton.com.au">support@chibibadminton.com.au</a>.</p>'
  );

  const { html, attachments } = getEmailTemplateWithLogo(htmlParts.join(''));
  const sent = await sendEmail({
    to: toTrimmed,
    subject,
    html,
    text: textParts.join('\n'),
    attachments,
  });

  if (!sent) {
    console.error('[email] Failed to send shop order confirmation email');
  }
}

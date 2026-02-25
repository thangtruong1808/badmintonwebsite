/**
 * Shared utilities for email templates: escaping, date formatting, name extraction.
 */

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Extract first name from full name. Returns "there" if empty. */
export function extractFirstName(name: string | undefined | null): string {
  const trimmed = (name ?? '').trim();
  if (!trimmed) return 'there';
  const first = trimmed.split(/\s+/)[0];
  return first ? first : 'there';
}

/** Format date for email display: "March - 12 - 2026" */
export function formatDateForEmail(dateStrOrDate: string | Date): string {
  const d = typeof dateStrOrDate === 'string' ? new Date(dateStrOrDate) : dateStrOrDate;
  if (Number.isNaN(d.getTime())) return String(dateStrOrDate);
  const month = d.toLocaleDateString('en-US', { month: 'long' });
  const day = d.getDate();
  const year = d.getFullYear();
  return `${month} - ${day} - ${year}`;
}

/** Format date+time string for email: "March - 12 - 2026 at 7:00 PM" (when input includes time) */
export function formatDateOrDateTimeForEmail(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const datePart = formatDateForEmail(d);
  const hasTime = /T|\d{1,2}:\d{2}/.test(dateStr.trim());
  if (!hasTime) return datePart;
  const timePart = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${datePart} at ${timePart}`;
}

/** Format date and time for email: "March - 12 - 2026 at 7:00 PM" */
export function formatDateTimeForEmail(dateStrOrDate: string | Date, timeStr?: string): string {
  const datePart = formatDateForEmail(dateStrOrDate);
  if (!timeStr) return datePart;
  return `${datePart} at ${timeStr}`;
}

/** Format Date object for email: "March - 12 - 2026 at 3:45 PM" */
export function formatDateObjectForEmail(d: Date): string {
  if (Number.isNaN(d.getTime())) return String(d);
  const datePart = formatDateForEmail(d);
  const timePart = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${datePart} at ${timePart}`;
}

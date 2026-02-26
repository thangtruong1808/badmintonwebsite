/**
 * Refund service for playtime registrations.
 * 1.8.1: Refund cancelled/removed users if outside 2h before event start.
 * 1.8.2: Refund everyone still on waitlist when event ends.
 * Requires: registrations.stripe_payment_intent_id, event_waitlist.stripe_payment_intent_id
 * Run via cron after events end.
 */
import type { RowDataPacket } from 'mysql2';
import pool from '../db/connection.js';

interface EventWithTime extends RowDataPacket {
  id: number;
  date: string;
  time: string;
}

interface Refundable extends RowDataPacket {
  stripe_payment_intent_id: string;
  id: string;
}

/**
 * Find events that have ended (date+time in the past).
 */
async function getCompletedEvents(): Promise<EventWithTime[]> {
  const [rows] = await pool.execute<EventWithTime[]>(
    `SELECT id, date, time FROM events
     WHERE CONCAT(date, ' ', time) < NOW()`
  );
  return rows || [];
}

/**
 * Get cancelled registrations for an event with stripe_payment_intent_id.
 * 1.8.1: Refund only if cancellation was outside 2h before event start.
 * (Requires registrations.cancelled_at to enforce; for now we refund all cancelled for completed events.)
 */
async function getRefundableCancelledRegistrations(eventId: number): Promise<Refundable[]> {
  const [rows] = await pool.execute<Refundable[]>(
    `SELECT id, stripe_payment_intent_id FROM registrations
     WHERE event_id = ? AND status = 'cancelled'
     AND stripe_payment_intent_id IS NOT NULL AND stripe_payment_intent_id != ''`,
    [eventId]
  );
  return rows || [];
}

/**
 * Get event_waitlist entries with stripe_payment_intent_id (pay-first-when-full flow).
 * Refund all when event ends.
 */
async function getRefundableWaitlistEntries(eventId: number): Promise<Refundable[]> {
  const [rows] = await pool.execute<Refundable[]>(
    `SELECT id, stripe_payment_intent_id FROM event_waitlist
     WHERE event_id = ?
     AND stripe_payment_intent_id IS NOT NULL AND stripe_payment_intent_id != ''`,
    [eventId]
  );
  return rows || [];
}

/**
 * Process refunds for completed events.
 * Returns { refunded: number, errors: string[] }.
 */
export async function processRefundsForCompletedEvents(): Promise<{
  refunded: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let refunded = 0;
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    return { refunded: 0, errors: ['STRIPE_SECRET_KEY not configured'] };
  }

  let Stripe: typeof import('stripe').default;
  try {
    const stripeModule = await import('stripe');
    Stripe = stripeModule.default;
  } catch {
    return { refunded: 0, errors: ['Stripe package not installed. Run: npm install stripe'] };
  }

  const stripe = new Stripe(stripeKey);
  const events = await getCompletedEvents();

  for (const ev of events) {
    const cancelled = await getRefundableCancelledRegistrations(ev.id);
    const waitlist = await getRefundableWaitlistEntries(ev.id);

    const toRefund = [...cancelled, ...waitlist];

    for (const row of toRefund) {
      const pi = row.stripe_payment_intent_id?.trim();
      if (!pi) continue;

      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(pi);
        if (paymentIntent.status !== 'succeeded') continue;

        const charges = paymentIntent.latest_charge;
        if (typeof charges === 'string' && charges) {
          await stripe.refunds.create({ charge: charges });
          refunded++;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`Refund failed for ${row.id}: ${msg}`);
      }
    }
  }

  return { refunded, errors };
}

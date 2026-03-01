/**
 * Webhook controller for handling Stripe events.
 * Processes checkout.session.completed to confirm payments and registrations.
 * Handles dispute events for chargeback tracking.
 */
import type { Request, Response, NextFunction } from 'express';
import { stripe, isStripeConfigured } from '../utils/stripe.js';
import {
  findByStripeCheckoutSessionId,
  updateByStripeCheckoutSessionId,
  findByStripeIntentId as findPaymentByIntentId,
  updateStatus as updatePaymentStatus,
} from '../services/paymentService.js';
import {
  create as createDispute,
  findByStripeDisputeId,
  updateStatus as updateDisputeStatus,
} from '../services/disputeService.js';
import { confirmPaymentForPendingRegistration } from '../services/registrationService.js';
import { confirmWaitlistPayment } from '../services/waitlistService.js';
import { addGuestsToRegistration } from '../services/registrationService.js';
import type Stripe from 'stripe';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

interface CheckoutMetadata {
  type: 'play' | 'addGuests' | 'waitlist' | 'shop';
  paymentId: string;
  userId: string;
  eventIds?: string;
  pendingRegistrationIds?: string;
  registrationId?: string;
  eventId?: string;
  guestCount?: string;
  pendingAddGuestsId?: string;
  pendingWaitlistId?: string;
  productIds?: string;
  items?: string;
}

export const handleStripeWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!isStripeConfigured() || !stripe) {
    res.status(500).json({ error: 'Stripe is not configured' });
    return;
  }

  if (!WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    res.status(500).json({ error: 'Webhook secret not configured' });
    return;
  }

  const sig = req.headers['stripe-signature'];
  if (!sig) {
    res.status(400).json({ error: 'Missing stripe-signature header' });
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    res.status(400).json({ error: `Webhook Error: ${message}` });
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.succeeded':
        console.log('Payment intent succeeded:', (event.data.object as Stripe.PaymentIntent).id);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object as Stripe.Dispute);
        break;

      case 'charge.dispute.updated':
        await handleDisputeUpdated(event.data.object as Stripe.Dispute);
        break;

      case 'charge.dispute.closed':
        await handleDisputeClosed(event.data.object as Stripe.Dispute);
        break;

      case 'checkout.session.expired':
        await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session);
        break;

      case 'checkout.session.async_payment_failed':
        await handleAsyncPaymentFailed(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.requires_action':
        await handlePaymentRequiresAction(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const metadata = session.metadata as unknown as CheckoutMetadata;

  if (!metadata || !metadata.type || !metadata.paymentId) {
    console.error('Missing metadata in checkout session:', session.id);
    return;
  }

  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id || null;

  await updateByStripeCheckoutSessionId(session.id, 'completed', paymentIntentId);

  console.log(`Processing ${metadata.type} checkout for user ${metadata.userId}`);

  switch (metadata.type) {
    case 'play':
      await handlePlayCheckout(metadata);
      break;

    case 'addGuests':
      await handleAddGuestsCheckout(metadata);
      break;

    case 'waitlist':
      await handleWaitlistCheckout(metadata);
      break;

    case 'shop':
      await handleShopCheckout(metadata, paymentIntentId);
      break;

    default:
      console.error('Unknown checkout type:', metadata.type);
  }
}

async function handlePlayCheckout(metadata: CheckoutMetadata): Promise<void> {
  const pendingRegistrationIds: string[] = metadata.pendingRegistrationIds
    ? JSON.parse(metadata.pendingRegistrationIds)
    : [];

  for (const pendingId of pendingRegistrationIds) {
    try {
      await confirmPaymentForPendingRegistration(pendingId);
      console.log(`Confirmed payment for pending registration: ${pendingId}`);
    } catch (error) {
      console.error(`Failed to confirm pending registration ${pendingId}:`, error);
    }
  }
}

async function handleAddGuestsCheckout(metadata: CheckoutMetadata): Promise<void> {
  if (!metadata.registrationId || !metadata.guestCount) {
    console.error('Missing registration data in add guests checkout');
    return;
  }

  try {
    const guestCount = Number(metadata.guestCount);

    await addGuestsToRegistration(
      metadata.userId,
      metadata.registrationId,
      guestCount,
      {
        pendingAddGuestsId: metadata.pendingAddGuestsId,
      }
    );
    console.log(`Added ${guestCount} guests to registration ${metadata.registrationId}`);
  } catch (error) {
    console.error('Failed to add guests:', error);
  }
}

async function handleWaitlistCheckout(metadata: CheckoutMetadata): Promise<void> {
  if (!metadata.pendingWaitlistId) {
    console.error('Missing pendingWaitlistId in waitlist checkout');
    return;
  }

  try {
    await confirmWaitlistPayment(metadata.userId, metadata.pendingWaitlistId);
    console.log(`Confirmed waitlist payment for pending: ${metadata.pendingWaitlistId}`);
  } catch (error) {
    console.error('Failed to confirm waitlist payment:', error);
  }
}

async function handleShopCheckout(
  metadata: CheckoutMetadata,
  paymentIntentId: string | null
): Promise<void> {
  if (!metadata.items) {
    console.error('Missing items in shop checkout');
    return;
  }

  try {
    const items = JSON.parse(metadata.items);

    // Import order service dynamically to avoid circular dependencies
    const { createOrderFromCheckout } = await import('../services/orderService.js');
    
    await createOrderFromCheckout({
      userId: metadata.userId,
      paymentId: metadata.paymentId,
      items,
      stripePaymentIntentId: paymentIntentId,
    });

    console.log(`Created order for user ${metadata.userId}`);
  } catch (error) {
    console.error('Failed to create order:', error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log('Payment failed:', paymentIntent.id);
  
  // Find and update payment record by payment intent ID
  const { findByStripeIntentId, updateStatus } = await import('../services/paymentService.js');
  const payment = await findByStripeIntentId(paymentIntent.id);
  
  if (payment) {
    await updateStatus(payment.id, 'failed');
    console.log(`Updated payment ${payment.id} to failed status`);
  }
}

async function handleDisputeCreated(dispute: Stripe.Dispute): Promise<void> {
  console.log('Dispute created:', dispute.id);

  try {
    const existingDispute = await findByStripeDisputeId(dispute.id);
    if (existingDispute) {
      console.log(`Dispute ${dispute.id} already exists, skipping creation`);
      return;
    }

    const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge?.id;
    const paymentIntentId = typeof dispute.payment_intent === 'string' 
      ? dispute.payment_intent 
      : dispute.payment_intent?.id;

    let paymentId: string | null = null;
    let userId: string | null = null;

    if (paymentIntentId) {
      const payment = await findPaymentByIntentId(paymentIntentId);
      if (payment) {
        paymentId = payment.id;
        userId = payment.user_id;
      }
    }

    const evidenceDueBy = dispute.evidence_details?.due_by 
      ? new Date(dispute.evidence_details.due_by * 1000)
      : null;

    await createDispute({
      stripeDisputeId: dispute.id,
      stripeChargeId: chargeId ?? null,
      userId,
      paymentId,
      amount: dispute.amount / 100,
      currency: dispute.currency.toUpperCase(),
      reason: dispute.reason ?? null,
      status: dispute.status,
      evidenceDueBy,
    });

    if (paymentId) {
      await updatePaymentStatus(paymentId, 'disputed');
      console.log(`Updated payment ${paymentId} to disputed status`);
    }

    console.log(`Created dispute record for ${dispute.id}`);
  } catch (error) {
    console.error('Failed to handle dispute created:', error);
  }
}

async function handleDisputeUpdated(dispute: Stripe.Dispute): Promise<void> {
  console.log('Dispute updated:', dispute.id, 'Status:', dispute.status);

  try {
    const existingDispute = await findByStripeDisputeId(dispute.id);
    
    if (!existingDispute) {
      console.log(`Dispute ${dispute.id} not found, creating it`);
      await handleDisputeCreated(dispute);
      return;
    }

    await updateDisputeStatus(dispute.id, dispute.status, dispute.reason ?? null);
    console.log(`Updated dispute ${dispute.id} to status: ${dispute.status}`);
  } catch (error) {
    console.error('Failed to handle dispute updated:', error);
  }
}

async function handleDisputeClosed(dispute: Stripe.Dispute): Promise<void> {
  console.log('Dispute closed:', dispute.id, 'Status:', dispute.status);

  try {
    const existingDispute = await findByStripeDisputeId(dispute.id);
    
    if (!existingDispute) {
      console.log(`Dispute ${dispute.id} not found, creating it`);
      await handleDisputeCreated(dispute);
      return;
    }

    await updateDisputeStatus(dispute.id, dispute.status, dispute.reason ?? null);
    console.log(`Closed dispute ${dispute.id} with final status: ${dispute.status}`);

    const paymentIntentId = typeof dispute.payment_intent === 'string'
      ? dispute.payment_intent
      : dispute.payment_intent?.id;

    if (paymentIntentId) {
      const payment = await findPaymentByIntentId(paymentIntentId);
      if (payment) {
        if (dispute.status === 'won') {
          await updatePaymentStatus(payment.id, 'completed');
          console.log(`Dispute won - restored payment ${payment.id} to completed status`);
        } else if (dispute.status === 'lost') {
          await updatePaymentStatus(payment.id, 'refunded');
          console.log(`Dispute lost - updated payment ${payment.id} to refunded status`);
        }
      }
    }
  } catch (error) {
    console.error('Failed to handle dispute closed:', error);
  }
}

async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session): Promise<void> {
  console.log('Checkout session expired:', session.id);

  try {
    await updateByStripeCheckoutSessionId(session.id, 'expired');
    console.log(`Updated payment to expired for session: ${session.id}`);

    const metadata = session.metadata as unknown as CheckoutMetadata;
    if (metadata?.pendingRegistrationIds) {
      const pendingIds: string[] = JSON.parse(metadata.pendingRegistrationIds);
      const pool = (await import('../db/connection.js')).default;
      
      for (const pendingId of pendingIds) {
        try {
          await pool.execute(
            `UPDATE registrations SET status = 'cancelled', cancelled_at = NOW() WHERE id = ? AND status = 'pending_payment'`,
            [pendingId]
          );
          console.log(`Cancelled pending registration ${pendingId} due to expired checkout`);
        } catch (err) {
          console.error(`Failed to cancel pending registration ${pendingId}:`, err);
        }
      }
    }

    if (metadata?.pendingAddGuestsId) {
      const pool = (await import('../db/connection.js')).default;
      try {
        await pool.execute(
          `DELETE FROM pending_add_guests WHERE id = ?`,
          [metadata.pendingAddGuestsId]
        );
        console.log(`Removed pending add guests ${metadata.pendingAddGuestsId} due to expired checkout`);
      } catch (err) {
        console.error(`Failed to remove pending add guests ${metadata.pendingAddGuestsId}:`, err);
      }
    }

    if (metadata?.pendingWaitlistId) {
      const pool = (await import('../db/connection.js')).default;
      try {
        await pool.execute(
          `DELETE FROM pending_event_waitlist WHERE id = ?`,
          [metadata.pendingWaitlistId]
        );
        console.log(`Removed pending waitlist ${metadata.pendingWaitlistId} due to expired checkout`);
      } catch (err) {
        console.error(`Failed to remove pending waitlist ${metadata.pendingWaitlistId}:`, err);
      }
    }
  } catch (error) {
    console.error('Failed to handle checkout session expired:', error);
  }
}

async function handleAsyncPaymentFailed(session: Stripe.Checkout.Session): Promise<void> {
  console.log('Async payment failed for session:', session.id);

  try {
    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id || null;

    await updateByStripeCheckoutSessionId(session.id, 'failed', paymentIntentId);
    console.log(`Updated payment to failed for session: ${session.id}`);

    const metadata = session.metadata as unknown as CheckoutMetadata;
    if (metadata?.pendingRegistrationIds) {
      const pendingIds: string[] = JSON.parse(metadata.pendingRegistrationIds);
      const pool = (await import('../db/connection.js')).default;
      
      for (const pendingId of pendingIds) {
        try {
          await pool.execute(
            `UPDATE registrations SET status = 'cancelled', cancelled_at = NOW() WHERE id = ? AND status IN ('pending_payment', 'confirmed')`,
            [pendingId]
          );
          console.log(`Cancelled registration ${pendingId} due to async payment failure`);
        } catch (err) {
          console.error(`Failed to cancel registration ${pendingId}:`, err);
        }
      }
    }
  } catch (error) {
    console.error('Failed to handle async payment failed:', error);
  }
}

async function handlePaymentRequiresAction(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log('Payment requires action:', paymentIntent.id);

  try {
    const payment = await findPaymentByIntentId(paymentIntent.id);
    if (payment) {
      await updatePaymentStatus(payment.id, 'requires_action');
      console.log(`Updated payment ${payment.id} to requires_action status`);
    }
  } catch (error) {
    console.error('Failed to handle payment requires action:', error);
  }
}

async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  console.log('Charge refunded:', charge.id);

  try {
    const paymentIntentId = typeof charge.payment_intent === 'string'
      ? charge.payment_intent
      : charge.payment_intent?.id;

    if (paymentIntentId) {
      const payment = await findPaymentByIntentId(paymentIntentId);
      if (payment) {
        await updatePaymentStatus(payment.id, 'refunded');
        console.log(`Updated payment ${payment.id} to refunded status`);
      }
    }
  } catch (error) {
    console.error('Failed to handle charge refunded:', error);
  }
}

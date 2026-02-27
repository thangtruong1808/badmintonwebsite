/**
 * Webhook routes for external service integrations.
 * NOTE: This router uses raw body parsing for Stripe signature verification.
 */
import { Router, raw } from 'express';
import { handleStripeWebhook } from '../controllers/webhookController.js';

const router = Router();

// Stripe webhook - must use raw body for signature verification
router.post(
  '/stripe',
  raw({ type: 'application/json' }),
  handleStripeWebhook
);

export default router;

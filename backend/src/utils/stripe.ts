/**
 * Stripe utility module.
 * Initializes and exports the Stripe client for use across the backend.
 */
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn('STRIPE_SECRET_KEY is not set. Stripe functionality will be disabled.');
}

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey)
  : null;

export const STRIPE_CURRENCY = process.env.STRIPE_CURRENCY || 'aud';

export const isStripeConfigured = (): boolean => {
  return !!stripe;
};

export default stripe;

/**
 * Stripe utility for frontend.
 * Loads Stripe.js with the publishable key.
 */
import { loadStripe, type Stripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePublishableKey) {
    console.warn('VITE_STRIPE_PUBLISHABLE_KEY is not set. Stripe functionality will be disabled.');
    return Promise.resolve(null);
  }

  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }

  return stripePromise;
};

export const isStripeConfigured = (): boolean => {
  return !!stripePublishableKey;
};

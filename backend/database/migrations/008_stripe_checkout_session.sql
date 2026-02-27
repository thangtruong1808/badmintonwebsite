-- Migration: Add stripe_checkout_session_id to payments table
-- Required for Stripe Checkout Session integration

ALTER TABLE payments
ADD COLUMN stripe_checkout_session_id VARCHAR(255) DEFAULT NULL AFTER stripe_payment_intent_id;

CREATE INDEX idx_payments_checkout_session ON payments(stripe_checkout_session_id);

-- Migration: Add payment tracking for refund logic
-- Run after 005_registration_guests.sql
-- Stores Stripe payment intent ID for refunds (1.8.1 cancelled/removed, 1.8.2 waitlist)

ALTER TABLE registrations
  ADD COLUMN stripe_payment_intent_id VARCHAR(255) NULL;

ALTER TABLE event_waitlist
  ADD COLUMN stripe_payment_intent_id VARCHAR(255) NULL;

CREATE INDEX idx_registrations_stripe_pi ON registrations(stripe_payment_intent_id);
CREATE INDEX idx_event_waitlist_stripe_pi ON event_waitlist(stripe_payment_intent_id);

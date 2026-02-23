-- Migration: Add guest_count, pending_payment_expires_at, and pending_payment status to registrations
-- Run after 001_event_waitlist.sql (or after schema.sql if event_waitlist was created)

ALTER TABLE registrations
  ADD COLUMN guest_count INT NOT NULL DEFAULT 0,
  ADD COLUMN pending_payment_expires_at DATETIME NULL;

ALTER TABLE registrations
  MODIFY COLUMN status ENUM('pending', 'confirmed', 'cancelled', 'pending_payment') NOT NULL DEFAULT 'pending';

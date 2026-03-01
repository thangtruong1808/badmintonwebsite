-- Migration: Enhanced payment statuses and refund tracking
-- Run this on existing databases
-- This migration supports:
--   1. Checkout session expiration (expired status)
--   2. Dispute tracking (disputed status)
--   3. BECS/3D Secure pending actions (requires_action status)
--   4. Conditional refund system with 24-hour rule

-- 1. Expand payment status enum to include new statuses
ALTER TABLE payments MODIFY COLUMN status 
  ENUM('pending', 'completed', 'failed', 'refunded', 'expired', 'disputed', 'requires_action') 
  NOT NULL DEFAULT 'pending';

-- 2. Add refund review tracking to registrations for conditional refund system
ALTER TABLE registrations ADD COLUMN refund_review_status 
  ENUM('none', 'pending_review', 'approved', 'denied') DEFAULT 'none';

ALTER TABLE registrations ADD COLUMN cancellation_reason TEXT DEFAULT NULL;

ALTER TABLE registrations ADD COLUMN cancelled_at DATETIME DEFAULT NULL;

-- 3. Add composite index for date-based cleanup queries (bulk delete feature)
CREATE INDEX idx_payments_status_created ON payments(status, created_at);

-- 4. Add index for refund review queries
CREATE INDEX idx_registrations_refund_review ON registrations(refund_review_status);

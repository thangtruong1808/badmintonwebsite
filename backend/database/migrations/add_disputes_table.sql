-- Migration: Add disputes table for Stripe dispute/chargeback tracking
-- Run this on existing databases

CREATE TABLE IF NOT EXISTS disputes (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    payment_id VARCHAR(255),
    stripe_dispute_id VARCHAR(255) NOT NULL UNIQUE,
    stripe_charge_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'AUD',
    reason VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    evidence_due_by DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,

    CHECK (amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_disputes_user ON disputes(user_id);
CREATE INDEX idx_disputes_payment ON disputes(payment_id);
CREATE INDEX idx_disputes_stripe_id ON disputes(stripe_dispute_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_created ON disputes(created_at);

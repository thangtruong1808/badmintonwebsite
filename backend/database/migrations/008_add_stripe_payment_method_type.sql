-- Migration: Add stripe_payment_method_type column to track actual Stripe payment types
-- (card, au_becs_debit, link, apple_pay, google_pay, etc.)

-- Add the new column if it doesn't exist
SET @column_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'payments' 
    AND COLUMN_NAME = 'stripe_payment_method_type'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE payments ADD COLUMN stripe_payment_method_type VARCHAR(50) DEFAULT NULL AFTER stripe_checkout_session_id',
    'SELECT "Column stripe_payment_method_type already exists"'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create index for efficient querying
SET @index_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'payments' 
    AND INDEX_NAME = 'idx_payments_stripe_method_type'
);

SET @sql_idx = IF(@index_exists = 0,
    'CREATE INDEX idx_payments_stripe_method_type ON payments(stripe_payment_method_type)',
    'SELECT "Index idx_payments_stripe_method_type already exists"'
);

PREPARE stmt_idx FROM @sql_idx;
EXECUTE stmt_idx;
DEALLOCATE PREPARE stmt_idx;

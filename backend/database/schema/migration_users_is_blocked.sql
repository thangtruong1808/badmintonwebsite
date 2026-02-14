-- Migration: Add is_blocked to users for block/unblock player feature
-- Run: mysql -u your_user -p chibibadminton_db < migration_users_is_blocked.sql

USE chibibadminton_db;

ALTER TABLE users ADD COLUMN is_blocked BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX idx_users_is_blocked ON users(is_blocked);

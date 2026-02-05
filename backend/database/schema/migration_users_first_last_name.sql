-- Migration: Replace users.name with first_name and last_name
-- Run: mysql -u your_user -p chibibadminton_db < migration_users_first_last_name.sql

USE chibibadminton_db;

-- Add new columns
ALTER TABLE users ADD COLUMN first_name VARCHAR(255) NULL AFTER id;
ALTER TABLE users ADD COLUMN last_name VARCHAR(255) NULL AFTER first_name;

-- Migrate existing data: split name on first space
UPDATE users SET
  first_name = SUBSTRING_INDEX(name, ' ', 1),
  last_name = IF(LOCATE(' ', name) > 0, SUBSTRING(name, LOCATE(' ', name) + 1), '');

-- Make columns NOT NULL and drop name
ALTER TABLE users MODIFY first_name VARCHAR(255) NOT NULL;
ALTER TABLE users MODIFY last_name VARCHAR(255) NOT NULL;
ALTER TABLE users DROP COLUMN name;

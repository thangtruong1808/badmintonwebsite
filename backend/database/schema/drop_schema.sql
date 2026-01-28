-- =====================================================
-- ChibiBadminton Database Schema - Drop Script
-- WARNING: This will delete all tables and data!
-- Use with caution - for testing/reset purposes only
-- =====================================================

-- Drop tables in reverse order of dependencies
-- (child tables first, then parent tables)

DROP TABLE IF EXISTS user_event_history;
DROP TABLE IF EXISTS reward_point_transactions;
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;

-- =====================================================
-- End of Drop Script
-- =====================================================

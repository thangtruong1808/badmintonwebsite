-- =====================================================
-- ChibiBadminton Database Schema - Drop Script
-- WARNING: This will delete all tables and data!
-- Use with caution - for testing/reset purposes only
-- =====================================================

-- Drop tables in reverse order of dependencies
-- (child tables first, then parent tables)

DROP TABLE IF EXISTS invoice_line_items;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS service_requests;
DROP TABLE IF EXISTS contact_messages;
DROP TABLE IF EXISTS newsletter_subscriptions;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS news_articles;
DROP TABLE IF EXISTS gallery_videos;
DROP TABLE IF EXISTS gallery_photos;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS user_event_history;
DROP TABLE IF EXISTS reward_point_transactions;
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS play_slots;
DROP TABLE IF EXISTS users;

-- =====================================================
-- End of Drop Script
-- =====================================================

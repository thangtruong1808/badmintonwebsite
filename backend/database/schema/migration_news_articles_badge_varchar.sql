-- Migration: Allow news_articles.badge to be any string (admin-entered) instead of ENUM
-- Run: mysql -u your_user -p chibibadminton_db < migration_news_articles_badge_varchar.sql

USE chibibadminton_db;

ALTER TABLE news_articles
  MODIFY COLUMN badge VARCHAR(100) NOT NULL DEFAULT 'OPEN';

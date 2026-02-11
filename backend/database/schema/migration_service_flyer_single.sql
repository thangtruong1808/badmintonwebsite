-- Migration: Single flyer for all service strings (remove image_url from service_strings)
-- Run: mysql -u your_user -p chibibadminton_db < migration_service_flyer_single.sql

USE chibibadminton_db;

-- =====================================================
-- Create service_config table (single row for flyer URL)
-- =====================================================
CREATE TABLE IF NOT EXISTS service_config (
    id INT PRIMARY KEY DEFAULT 1,
    flyer_image_url VARCHAR(500) DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO service_config (id, flyer_image_url) VALUES (1, NULL)
ON DUPLICATE KEY UPDATE id = id;

-- =====================================================
-- Remove image_url from service_strings
-- =====================================================
ALTER TABLE service_strings DROP COLUMN image_url;

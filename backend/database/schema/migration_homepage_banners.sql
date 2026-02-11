-- Migration: Add homepage_banners table for carousel (Cloudinary 1920x600)
-- Run: mysql -u your_user -p chibibadminton_db < migration_homepage_banners.sql

USE chibibadminton_db;

-- =====================================================
-- Table: homepage_banners
-- Stores homepage carousel banners (images from Cloudinary, 1920x600)
-- =====================================================
CREATE TABLE IF NOT EXISTS homepage_banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) DEFAULT NULL,
    cloudinary_public_id VARCHAR(255) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CHECK (display_order >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_homepage_banners_is_active ON homepage_banners(is_active);
CREATE INDEX idx_homepage_banners_display_order ON homepage_banners(display_order);
CREATE INDEX idx_homepage_banners_active_order ON homepage_banners(is_active, display_order);

-- Optional: example seed (replace with real Cloudinary URLs after upload)
-- INSERT INTO homepage_banners (title, cloudinary_public_id, image_url, alt_text, display_order, is_active)
-- VALUES ('Welcome', 'chibibadminton/banners/banner_1', 'https://res.cloudinary.com/your-cloud/image/upload/w_1920,h_600,c_fill,g_auto/...', 'ChibiBadminton Banner 1', 0, TRUE);

-- Migration: Add key_persons table for About Us team/leadership (Cloudinary image optional)
-- Run: mysql -u your_user -p chibibadminton_db < migration_key_persons.sql

USE chibibadminton_db;

-- =====================================================
-- Table: key_persons
-- Stores key persons (team/leadership) for About Us page
-- =====================================================
CREATE TABLE IF NOT EXISTS key_persons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    image_url VARCHAR(500) DEFAULT NULL,
    cloudinary_public_id VARCHAR(255) DEFAULT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CHECK (display_order >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_key_persons_display_order ON key_persons(display_order);
CREATE INDEX idx_key_persons_display_order_id ON key_persons(display_order, id);

-- Optional seed: two example key persons (no image; placeholder will show)
INSERT INTO key_persons (first_name, last_name, role, description, display_order)
VALUES
    ('Jane', 'Smith', 'Club President', 'Leads the club with a passion for building an inclusive badminton community.', 0),
    ('John', 'Doe', 'Head Coach', 'Brings years of coaching experience to help players of all levels improve their game.', 1);

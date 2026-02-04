-- Migration: Add play_slots table for recurring social play session templates
-- Run: mysql -u your_user -p chibibadminton_db < migration_play_slots.sql

USE chibibadminton_db;

-- =====================================================
-- Table: play_slots
-- Stores recurring social play slot templates (Wed/Fri, extensible)
-- =====================================================
CREATE TABLE IF NOT EXISTS play_slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
    time VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    max_capacity INT NOT NULL DEFAULT 45,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CHECK (max_capacity > 0),
    CHECK (price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_play_slots_day ON play_slots(day_of_week);
CREATE INDEX idx_play_slots_is_active ON play_slots(is_active);

-- Seed initial Wednesday and Friday slots
INSERT INTO play_slots (day_of_week, time, location, title, description, price, max_capacity, is_active)
VALUES
    ('Wednesday', '7:00 PM - 10:00 PM', 'Altona SportsPoint Badminton Club', 'Wednesday Playtime', 'Weekly Wednesday social play session. All skill levels welcome!', 20, 45, TRUE),
    ('Friday', '7:00 PM - 10:00 PM', 'Stomers Badminton Club', 'Friday Playtime', 'Weekly Friday social play session. Fun games and friendly matches!', 20, 45, TRUE);

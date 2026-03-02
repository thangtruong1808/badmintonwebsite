-- Migration: 010_vets_events.sql
-- Description: Create tables for VETS event interest sign-up feature

-- 1. vets_events - Admin-managed list of VETS events
CREATE TABLE IF NOT EXISTS vets_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for vets_events
CREATE INDEX idx_vets_events_date ON vets_events(event_date);
CREATE INDEX idx_vets_events_active ON vets_events(is_active);
CREATE INDEX idx_vets_events_active_date ON vets_events(is_active, event_date);

-- 2. vets_interests - Player sign-ups
CREATE TABLE IF NOT EXISTS vets_interests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    player_rating TEXT,
    status ENUM('interested', 'contacted', 'registered', 'cancelled') NOT NULL DEFAULT 'interested',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for vets_interests
CREATE INDEX idx_vets_interests_email ON vets_interests(email);
CREATE INDEX idx_vets_interests_status ON vets_interests(status);
CREATE INDEX idx_vets_interests_created ON vets_interests(created_at);

-- 3. vets_interest_events - Junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS vets_interest_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    interest_id INT NOT NULL,
    event_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interest_id) REFERENCES vets_interests(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES vets_events(id) ON DELETE CASCADE,
    UNIQUE KEY unique_interest_event (interest_id, event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for vets_interest_events
CREATE INDEX idx_vets_interest_events_interest ON vets_interest_events(interest_id);
CREATE INDEX idx_vets_interest_events_event ON vets_interest_events(event_id);

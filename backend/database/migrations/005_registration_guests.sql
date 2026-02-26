-- Migration: Create registration_guests table for friend names
-- Run: mysql -u your_user -p chibibadminton_db < database/migrations/005_registration_guests.sql
-- Stores individual guest names per registration. Admin can CRUD; users can update via frontend.

CREATE TABLE IF NOT EXISTS registration_guests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registration_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_registration_guests_registration ON registration_guests(registration_id);

-- Migration: Create courts table for play slots
-- Run: mysql -u your_user -p chibibadminton_db < database/migrations/004_courts.sql
-- Admins can CRUD court labels (Court 1, Court 2, etc.) per play slot. Displayed on play page.

CREATE TABLE IF NOT EXISTS courts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  play_slot_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (play_slot_id) REFERENCES play_slots(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_courts_play_slot ON courts(play_slot_id);
